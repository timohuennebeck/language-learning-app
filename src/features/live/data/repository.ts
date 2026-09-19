import { FunctionsHttpError } from '@supabase/supabase-js';

import type { Level } from '@/features/auth/data/types';
import type {
  ConversationReview,
  ConversationSummary,
  EndConversationResult,
  LiveKind,
  LiveTask,
  StartConversationResult,
  TranscriptTurn,
} from '@/features/live/data/types';
import { supabase } from '@/shared/lib/supabase';

/** Stable error codes the edge functions return (`{ error: code }`); the UI maps them to copy. */
export class LiveError extends Error {
  constructor(
    public code: string,
    message?: string,
  ) {
    super(message ?? code);
  }
}

async function invoke<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(name, { body });
  if (error) {
    if (error instanceof FunctionsHttpError) {
      const payload = (await error.context.json().catch(() => null)) as {
        error?: string;
        message?: string;
      } | null;
      throw new LiveError(payload?.error ?? 'request_failed', payload?.message);
    }
    throw new LiveError('network', error.message);
  }
  if (!data) throw new LiveError('request_failed');
  return data;
}

export interface StartConversationInput {
  kind: LiveKind;
  scenarioSlug?: string;
  deviceId: string | null;
}

export function startConversation(input: StartConversationInput): Promise<StartConversationResult> {
  return invoke('start-conversation', { ...input });
}

export interface EndConversationInput {
  conversationId: string;
  endReason: 'user' | 'max_duration' | 'error';
  durationSeconds: number;
  transcript: TranscriptTurn[];
  tasksDone: string[];
  usage: Record<string, unknown> | null;
}

export function endConversation(input: EndConversationInput): Promise<EndConversationResult> {
  return invoke('end-conversation', { ...input });
}

export async function getConversation(id: string): Promise<ConversationSummary> {
  const { data, error } = await supabase
    .from('conversations')
    .select('id, kind, topic, level, duration_seconds, review, scenarios(tasks)')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return {
    id: data.id,
    kind: data.kind,
    title: data.topic,
    level: data.level as Level | null,
    durationSeconds: data.duration_seconds ?? 0,
    review: data.review as unknown as ConversationReview | null,
    tasks: ((data.scenarios as { tasks: unknown } | null)?.tasks ?? []) as LiveTask[],
  };
}
