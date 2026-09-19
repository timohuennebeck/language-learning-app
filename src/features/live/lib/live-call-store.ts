import { useSyncExternalStore } from 'react';

import { endConversation, startConversation } from '@/features/live/data/repository';
import type { EndConversationResult, LiveKind, TranscriptTurn } from '@/features/live/data/types';
import { getDeviceId } from '@/features/live/lib/device-id';
import type { RealtimeConnection, RealtimeServerEvent } from '@/features/live/lib/realtime-events';
import { connectRealtime } from '@/features/live/lib/realtime-transport';

export type LiveStatus = 'idle' | 'starting' | 'live' | 'ending' | 'ended' | 'error';

export interface LiveTaskState {
  id: string;
  text: Record<string, string>;
  hint?: string;
  done: boolean;
}

export interface LiveCallState {
  status: LiveStatus;
  kind: LiveKind | null;
  conversationId: string | null;
  title: string | null;
  brief: Record<string, string>;
  tasks: LiveTaskState[];
  /** Seconds since the call went live. */
  elapsed: number;
  maxSeconds: number;
  muted: boolean;
  subtitles: boolean;
  /** Pip's current line (streamed transcript of the audio being played). */
  caption: string;
  errorCode: string | null;
  result: EndConversationResult | null;
}

const INITIAL: LiveCallState = {
  status: 'idle',
  kind: null,
  conversationId: null,
  title: null,
  brief: {},
  tasks: [],
  elapsed: 0,
  maxSeconds: 360,
  muted: false,
  subtitles: true,
  caption: '',
  errorCode: null,
  result: null,
};

/**
 * One live call at a time, kept outside React so the call survives the task sheet being pushed
 * over it and the evaluation screen can wait for the review after the call screen is gone.
 */
let state: LiveCallState = INITIAL;
const listeners = new Set<() => void>();

function set(patch: Partial<LiveCallState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

let connection: RealtimeConnection | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let startedAt = 0;
let transcript: TranscriptTurn[] = [];
let usage: Record<string, unknown> | null = null;
let ending: Promise<EndConversationResult> | null = null;

function cleanupConnection() {
  if (timer) clearInterval(timer);
  timer = null;
  connection?.close();
  connection = null;
}

function onEvent(e: RealtimeServerEvent) {
  switch (e.type) {
    case 'conversation.item.input_audio_transcription.completed':
      if (e.transcript?.trim()) transcript.push({ role: 'user', text: e.transcript.trim() });
      break;
    case 'response.created':
      set({ caption: '' });
      break;
    case 'response.output_audio_transcript.delta':
      if (e.delta) set({ caption: state.caption + e.delta });
      break;
    case 'response.output_audio_transcript.done':
      if (e.transcript?.trim()) {
        transcript.push({ role: 'assistant', text: e.transcript.trim() });
        set({ caption: e.transcript.trim() });
      }
      break;
    case 'response.function_call_arguments.done': {
      if (e.name !== 'mark_task_done' || !e.call_id) break;
      let taskId: string | undefined;
      try {
        taskId = (JSON.parse(e.arguments ?? '{}') as { task_id?: string }).task_id;
      } catch {
        /* ignore malformed arguments */
      }
      if (taskId)
        set({ tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, done: true } : t)) });
      connection?.send({
        type: 'conversation.item.create',
        item: { type: 'function_call_output', call_id: e.call_id, output: '{"ok":true}' },
      });
      connection?.send({ type: 'response.create' });
      break;
    }
    case 'response.done':
      if (e.response?.usage) usage = mergeUsage(usage, e.response.usage);
      break;
    case 'error':
      console.warn('realtime error', e.error);
      break;
  }
}

/** Sums the per-response token counts so the row stores the call's total. */
function mergeUsage(total: Record<string, unknown> | null, next: Record<string, unknown>) {
  const out: Record<string, unknown> = { ...(total ?? {}) };
  for (const [k, v] of Object.entries(next)) {
    if (typeof v === 'number') out[k] = (typeof out[k] === 'number' ? (out[k] as number) : 0) + v;
    else if (v && typeof v === 'object') {
      out[k] = mergeUsage(
        (out[k] as Record<string, unknown>) ?? null,
        v as Record<string, unknown>,
      );
    }
  }
  return out;
}

function errorCodeOf(e: unknown): string {
  if (e && typeof e === 'object' && 'code' in e && typeof e.code === 'string') return e.code;
  const message = e instanceof Error ? e.message : '';
  if (/permission|NotAllowed|denied/i.test(message)) return 'microphone';
  return 'request_failed';
}

export interface StartCallInput {
  kind: LiveKind;
  scenarioSlug?: string;
}

export async function startCall(input: StartCallInput): Promise<void> {
  if (state.status === 'starting' || state.status === 'live' || state.status === 'ending') return;
  cleanupConnection();
  transcript = [];
  usage = null;
  ending = null;
  set({ ...INITIAL, status: 'starting', kind: input.kind });
  try {
    const started = await startConversation({
      kind: input.kind,
      scenarioSlug: input.scenarioSlug,
      deviceId: await getDeviceId(),
    });
    set({
      conversationId: started.conversationId,
      title: started.title,
      brief: started.brief,
      tasks: started.tasks.map((t) => ({ ...t, done: false })),
      maxSeconds: started.maxSeconds,
    });
    connection = await connectRealtime({
      clientSecret: started.clientSecret,
      model: started.model,
      onEvent,
      onDisconnect: () => {
        if (state.status === 'live') void endCall('error');
      },
    });
    startedAt = Date.now();
    timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      set({ elapsed });
      if (elapsed >= state.maxSeconds) void endCall('max_duration');
    }, 1000);
    // Pip opens the conversation.
    connection.send({ type: 'response.create' });
    set({ status: 'live' });
  } catch (e) {
    cleanupConnection();
    set({ status: 'error', errorCode: errorCodeOf(e) });
    if (state.conversationId) {
      // The row exists but the call never happened: close it as failed so it costs nothing.
      void endConversation({
        conversationId: state.conversationId,
        endReason: 'error',
        durationSeconds: 0,
        transcript: [],
        tasksDone: [],
        usage: null,
      }).catch(() => {});
    }
  }
}

/** Ends the call and resolves with the review once end-conversation has written it. */
export function endCall(reason: 'user' | 'max_duration' | 'error'): Promise<EndConversationResult> {
  if (ending) return ending;
  const conversationId = state.conversationId;
  const durationSeconds = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0;
  cleanupConnection();
  set({ status: 'ending', caption: '' });
  const failed: EndConversationResult = { status: 'failed', review: null, level: null };
  ending = (
    conversationId
      ? endConversation({
          conversationId,
          endReason: reason,
          durationSeconds,
          transcript,
          tasksDone: state.tasks.filter((t) => t.done).map((t) => t.id),
          usage,
        })
      : Promise.resolve(failed)
  )
    .catch(() => failed)
    .then((result) => {
      set({ status: 'ended', result });
      return result;
    });
  return ending;
}

export function setMuted(muted: boolean) {
  connection?.setMuted(muted);
  set({ muted });
}

export function setSubtitles(subtitles: boolean) {
  set({ subtitles });
}

/** Back to idle (after the done/evaluation screen consumed the result). A live call is ended first. */
export function resetCall() {
  if (state.status === 'live' || state.status === 'starting') void endCall('user');
  ending = null;
  set(INITIAL);
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const getSnapshot = () => state;

export function useLiveCallState(): LiveCallState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
