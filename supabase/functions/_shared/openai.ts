// Thin OpenAI client for the edge functions (fetch only, no SDK).
//
// Secrets: OPENAI_API_KEY (required); OPENAI_LIVE_MODEL, OPENAI_LIVE_VOICE, OPENAI_REVIEW_MODEL
// (optional). The call runs on the Live API (GPT-Live-1): the app sends its WebRTC offer, the
// server creates the session with the API key and returns the answer, so no key or client secret
// ever reaches the device.
//   supabase secrets set OPENAI_API_KEY=sk-… OPENAI_LIVE_MODEL=gpt-live-1

import { HttpError } from './http.ts';

const BASE = 'https://api.openai.com/v1';

export const LIVE_MODEL = Deno.env.get('OPENAI_LIVE_MODEL') ?? 'gpt-live-1';
/** Text model for the review after the call and for the tasks the Live model delegates. */
export const REVIEW_MODEL = Deno.env.get('OPENAI_REVIEW_MODEL') ?? 'gpt-5-mini';
/** Live voice (built-in voice name; `marin` is the API default). */
export const VOICE = Deno.env.get('OPENAI_LIVE_VOICE') ?? 'marin';

function apiKey(): string {
  const key = Deno.env.get('OPENAI_API_KEY');
  if (!key) throw new HttpError(500, 'openai_not_configured', 'OPENAI_API_KEY is not set');
  return key;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`OpenAI ${path} ${res.status}: ${text}`);
    throw new HttpError(502, 'openai_error', `OpenAI ${path} failed with ${res.status}`);
  }
  return JSON.parse(text) as T;
}

export interface FunctionTool {
  type: 'function';
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  strict: boolean;
}

export interface LiveSessionOptions {
  /** The app's WebRTC SDP offer. */
  sdp: string;
  /** Frontend instructions: voice, conversation, when to delegate (Live prompting guide). */
  instructions: string;
  /** Backend prompt for the Responses model the Live session delegates tasks to. */
  backendInstructions: string;
  /** Empty for a talk with nothing to record; the session then gets no backend at all. */
  tools: FunctionTool[];
  /** A text message placed in the history before the session starts (makes Pip open the talk). */
  opening: string;
}

export interface LiveSession {
  sessionId: string;
  /** SDP answer for the app's peer connection. */
  sdp: string;
  model: string;
}

/**
 * Client events the untrusted frontend data channel may send. Everything that could reshape the
 * conversation (instructions, commentary, session updates) stays server-side.
 */
const CLIENT_EVENTS = [
  'session.input_audio.mute',
  'session.input_audio.unmute',
  'response.item.create',
  'response.create',
  'session.close',
];

/** Creates a Live WebRTC session (`POST /live/sessions`) and returns the SDP answer. */
export async function createLiveSession(o: LiveSessionOptions): Promise<LiveSession> {
  const res = await post<{ session: { id: string }; transport: { sdp: string } }>(
    '/live/sessions',
    {
      session: {
        model: LIVE_MODEL,
        instructions: o.instructions,
        audio: { output: { voice: VOICE } },
        input: [
          {
            type: 'message',
            role: 'developer',
            content: [{ type: 'input_text', text: o.opening }],
          },
        ],
        client: { data_channel: { allowed_client_events: CLIENT_EVENTS } },
        // A backend exists only to record task progress. A free talk has no tasks, and leaving
        // the delegation configured there gave the voice model something to hand the opening
        // greeting to: the backend answered with a bare reasoning item, the API reported
        // "Responses handoff incomplete", and Pip said "Hmm." instead of greeting the learner.
        ...(o.tools.length
          ? {
              delegation: {
                type: 'responses',
                responses: {
                  model: REVIEW_MODEL,
                  instructions: o.backendInstructions,
                  tools: o.tools,
                  tool_choice: 'auto',
                  // `max_output_tokens` also covers reasoning tokens. At 200 a reasoning model
                  // spent the whole budget thinking and the turn ended `incomplete` before it
                  // ever emitted the `mark_task_done` call, so no task was recorded. The visible
                  // reply is one word, so a wide budget costs almost nothing.
                  reasoning: { effort: 'low' },
                  max_output_tokens: 2000,
                },
              },
            }
          : {}),
        store: false,
      },
      transport: { type: 'webrtc', sdp: o.sdp },
    },
  );
  return { sessionId: res.session.id, sdp: res.transport.sdp, model: LIVE_MODEL };
}

/** One structured-output call on the Responses API; returns the parsed JSON object. */
export async function respondJson<T>(
  instructions: string,
  input: string,
  schemaName: string,
  schema: Record<string, unknown>,
): Promise<T> {
  const res = await post<{
    output: { type: string; content?: { type: string; text?: string }[] }[];
  }>('/responses', {
    model: REVIEW_MODEL,
    instructions,
    input,
    reasoning: { effort: 'low' },
    text: { format: { type: 'json_schema', name: schemaName, strict: true, schema } },
  });
  const message = res.output.find((o) => o.type === 'message');
  const text = message?.content?.find((c) => c.type === 'output_text')?.text;
  if (!text) throw new HttpError(502, 'openai_error', 'Responses API returned no text');
  return JSON.parse(text) as T;
}
