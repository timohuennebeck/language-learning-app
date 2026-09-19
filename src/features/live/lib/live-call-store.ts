import { useSyncExternalStore } from 'react';

import { endConversation, startConversation } from '@/features/live/data/repository';
import type { EndConversationResult, LiveKind } from '@/features/live/data/types';
import { getDeviceId } from '@/features/live/lib/device-id';
import {
  CONNECT_TIMEOUT_MS,
  type LiveConnection,
  type LiveServerEvent,
} from '@/features/live/lib/live-protocol';
import { connectLive } from '@/features/live/lib/live-transport';
import { TranscriptCollector } from '@/features/live/lib/transcript';
import type { ScenarioTask } from '@/features/speak/data/types';

export type LiveStatus = 'idle' | 'starting' | 'live' | 'ending' | 'ended' | 'error';

export interface LiveTaskState extends ScenarioTask {
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
  /** Pip's current line (transcript of the audio being played). */
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

/** How long to wait for the API's `session.closed` (final usage) before hanging up anyway. */
const CLOSE_GRACE_MS = 1500;

/**
 * One live call at a time, kept outside React so the call survives the task sheet being pushed
 * over it and the evaluation screen can wait for the review after the call screen is gone.
 *
 * Every start bumps `generation`; async steps compare against it so a call that was reset or
 * ended while still connecting cleans itself up instead of resurrecting the store.
 */
let state: LiveCallState = INITIAL;
const listeners = new Set<() => void>();

function set(patch: Partial<LiveCallState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

let generation = 0;
let connection: LiveConnection | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let startedAt = 0;
let transcript = new TranscriptCollector();
let audioSeconds = 0;
let delegationUsage: Record<string, number> = {};
let ending: Promise<EndConversationResult> | null = null;
let sessionClosed: (() => void) | null = null;
let sessionStarted: (() => void) | null = null;

function cleanupConnection() {
  if (timer) clearInterval(timer);
  timer = null;
  connection?.close();
  connection = null;
  sessionStarted = null;
  sessionClosed = null;
}

function onEvent(e: LiveServerEvent) {
  switch (e.type) {
    case 'session.started':
      sessionStarted?.();
      break;
    case 'session.input_transcript.delta':
      if (e.delta) transcript.add('user', e.delta, e.start_ms ?? 0, e.end_ms ?? 0);
      break;
    case 'session.output_transcript.delta':
      if (e.delta) {
        transcript.add('assistant', e.delta, e.start_ms ?? 0, e.end_ms ?? 0);
        set({ caption: transcript.currentAssistantLine() });
      }
      break;
    case 'session.usage.updated':
    case 'session.closed':
      if (typeof e.usage?.seconds === 'number') audioSeconds = e.usage.seconds;
      if (e.type === 'session.closed') sessionClosed?.();
      break;
    case 'response.event':
      onResponseEvent(e);
      break;
    case 'error':
      console.warn('live error', e.error);
      break;
  }
}

/** Nested Responses events from the delegated backend: the `mark_task_done` calls and token usage. */
function onResponseEvent(e: LiveServerEvent) {
  const nested = e.event;
  if (!nested) return;
  if (nested.type === 'response.output_item.done' && nested.item?.type === 'function_call') {
    const { name, call_id: callId, arguments: args } = nested.item;
    if (name !== 'mark_task_done' || !callId) return;
    let taskId: string | undefined;
    try {
      taskId = (JSON.parse(args ?? '{}') as { task_id?: string }).task_id;
    } catch {
      /* ignore malformed arguments */
    }
    if (taskId)
      set({ tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, done: true } : t)) });
    connection?.send({
      type: 'response.item.create',
      item: { type: 'function_call_output', call_id: callId, output: '{"ok":true}' },
    });
    connection?.send({ type: 'response.create' });
  }
  if (nested.type === 'response.completed' && nested.response?.usage) {
    for (const [k, v] of Object.entries(nested.response.usage)) {
      if (typeof v === 'number') delegationUsage[k] = (delegationUsage[k] ?? 0) + v;
    }
  }
}

function errorCodeOf(e: unknown): string {
  if (e && typeof e === 'object') {
    if ('code' in e && typeof e.code === 'string') return e.code;
    const name = 'name' in e ? String(e.name) : '';
    const message = 'message' in e ? String(e.message) : '';
    if (/NotAllowed|Security|Permission|denied/i.test(`${name} ${message}`)) return 'microphone';
  }
  return 'request_failed';
}

const withTimeout = <T>(p: Promise<T>, ms: number, why: string) =>
  Promise.race([
    p,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(why)), ms)),
  ]);

export interface StartCallInput {
  kind: LiveKind;
  scenarioSlug?: string;
}

export async function startCall(input: StartCallInput): Promise<void> {
  if (state.status === 'starting' || state.status === 'live' || state.status === 'ending') return;
  const gen = ++generation;
  cleanupConnection();
  transcript = new TranscriptCollector();
  audioSeconds = 0;
  delegationUsage = {};
  ending = null;
  set({ ...INITIAL, status: 'starting', kind: input.kind });

  let conversationId: string | null = null;
  let conn: LiveConnection | null = null;
  try {
    const deviceId = await getDeviceId();
    const started = new Promise<void>((resolve) => {
      sessionStarted = resolve;
    });
    conn = await withTimeout(
      connectLive({
        // The microphone is opened before the offer, so a denied permission costs nothing.
        exchangeSdp: async (sdp) => {
          if (gen !== generation) throw new Error('cancelled');
          const r = await startConversation({
            kind: input.kind,
            sdp,
            scenarioSlug: input.scenarioSlug,
            deviceId,
          });
          conversationId = r.conversationId;
          if (gen === generation) {
            set({
              conversationId: r.conversationId,
              title: r.title,
              brief: r.brief,
              tasks: r.tasks.map((t) => ({ ...t, done: false })),
              maxSeconds: r.maxSeconds,
            });
          }
          return r.sdp;
        },
        onEvent: (e) => {
          if (gen === generation) onEvent(e);
        },
        onDisconnect: () => {
          if (gen === generation && state.status === 'live') void endCall('error');
        },
      }),
      CONNECT_TIMEOUT_MS,
      'Live connection timed out',
    );
    if (gen !== generation) throw new Error('cancelled');
    connection = conn;
    await withTimeout(started, 10_000, 'Live session did not start');
    if (gen !== generation) throw new Error('cancelled');

    startedAt = Date.now();
    timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      set({ elapsed });
      if (elapsed >= state.maxSeconds) void endCall('max_duration');
    }, 1000);
    set({ status: 'live' });
  } catch (e) {
    conn?.close();
    if (connection === conn) connection = null;
    const cancelled = gen !== generation;
    if (!cancelled) {
      cleanupConnection();
      set({ status: 'error', errorCode: errorCodeOf(e) });
    }
    if (conversationId) {
      // The row exists but the call never happened: close it as failed so it costs nothing.
      void endConversation({
        conversationId,
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
  const gen = generation;
  const conversationId = state.conversationId;
  const durationSeconds = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0;
  const conn = connection;
  if (timer) clearInterval(timer);
  timer = null;
  set({ status: 'ending', caption: '' });
  const failed: EndConversationResult = { status: 'failed', review: null, level: null };

  const hangUp = async () => {
    if (!conn) return;
    // Ask the API to finalize so the last transcript deltas and the final usage arrive.
    const closed = new Promise<void>((resolve) => {
      sessionClosed = resolve;
    });
    conn.send({ type: 'session.close' });
    await Promise.race([closed, new Promise<void>((r) => setTimeout(r, CLOSE_GRACE_MS))]);
    conn.close();
    if (connection === conn) connection = null;
  };

  const p = hangUp()
    .then(() =>
      conversationId
        ? endConversation({
            conversationId,
            endReason: reason,
            durationSeconds,
            transcript: transcript.all(),
            tasksDone: state.tasks.filter((t) => t.done).map((t) => t.id),
            usage: { audio_seconds: audioSeconds, delegation: delegationUsage },
          })
        : failed,
    )
    .catch(() => failed)
    .then((result) => {
      // A reset while ending (screen left) must not resurrect the store.
      if (gen === generation) set({ status: 'ended', result });
      return result;
    });
  ending = p;
  return p;
}

export function setMuted(muted: boolean) {
  connection?.setMuted(muted);
  connection?.send({ type: muted ? 'session.input_audio.mute' : 'session.input_audio.unmute' });
  set({ muted });
}

export function setSubtitles(subtitles: boolean) {
  set({ subtitles });
}

/** Back to idle (after the done/evaluation screen consumed the result). A running call is ended first. */
export function resetCall() {
  if (state.status === 'live') void endCall('user');
  generation++;
  cleanupConnection();
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
