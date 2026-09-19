import type { Level } from '@/features/auth/data/types';
import type { ScenarioTask } from '@/features/speak/data/types';

export type LiveKind = 'placement' | 'free' | 'scenario';

export interface TranscriptTurn {
  role: 'user' | 'assistant';
  text: string;
}

export interface StartConversationResult {
  conversationId: string;
  /** OpenAI Live session id (`conversations.provider_session_id`). */
  sessionId: string;
  /** SDP answer for the app's peer connection. */
  sdp: string;
  model: string;
  maxSeconds: number;
  title: string | null;
  /** Scenario brief per app locale (empty for free talk). */
  brief: Record<string, string>;
  tasks: ScenarioTask[];
}

export interface ReviewTask {
  id: string;
  done: boolean;
  /** What the learner said to complete it, verbatim. */
  said: string | null;
}

export interface ReviewWord {
  front: string;
  back: string;
  example: string | null;
}

/** `conversations.review`, written once by end-conversation. */
export interface ConversationReview {
  summary: string;
  tasks: ReviewTask[];
  level: Level | null;
  evidence: string[];
  words: ReviewWord[];
}

export interface EndConversationResult {
  status: 'ended' | 'failed';
  review: ConversationReview | null;
  level: Level | null;
}

/** What the done screen shows for a finished call. */
export interface ConversationSummary {
  id: string;
  kind: LiveKind;
  title: string | null;
  level: Level | null;
  durationSeconds: number;
  review: ConversationReview | null;
  /** The scenario's task texts (the review only carries ids). */
  tasks: ScenarioTask[];
}
