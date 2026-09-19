// Thin OpenAI client for the edge functions (fetch only, no SDK).
//
// Secrets: OPENAI_API_KEY (required), OPENAI_REALTIME_MODEL and OPENAI_REVIEW_MODEL (optional).
// The realtime model id is configurable so the live model can be switched without a redeploy:
//   supabase secrets set OPENAI_REALTIME_MODEL=gpt-realtime-2.1

import { HttpError } from './http.ts';

const BASE = 'https://api.openai.com/v1';

export const REALTIME_MODEL = Deno.env.get('OPENAI_REALTIME_MODEL') ?? 'gpt-realtime-2.1';
export const REVIEW_MODEL = Deno.env.get('OPENAI_REVIEW_MODEL') ?? 'gpt-5-mini';
/** Realtime voice; see the voice list in the Realtime guide. */
export const VOICE = Deno.env.get('OPENAI_REALTIME_VOICE') ?? 'marin';

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
}

export interface ClientSecretOptions {
  instructions: string;
  /** ISO-639-1 code of the language the learner speaks (input transcription hint). */
  language: string;
  tools: FunctionTool[];
  /** Seconds the secret stays valid for starting the call (not the call length). */
  expiresInSeconds: number;
}

export interface ClientSecret {
  value: string;
  expiresAt: number;
  model: string;
}

/** Mints an ephemeral client secret; the app opens the WebRTC call with it (the API key never leaves the server). */
export async function createClientSecret(o: ClientSecretOptions): Promise<ClientSecret> {
  const res = await post<{ value: string; expires_at: number }>('/realtime/client_secrets', {
    expires_after: { anchor: 'created_at', seconds: o.expiresInSeconds },
    session: {
      type: 'realtime',
      model: REALTIME_MODEL,
      instructions: o.instructions,
      output_modalities: ['audio'],
      tools: o.tools,
      tool_choice: 'auto',
      max_output_tokens: 400,
      audio: {
        input: {
          transcription: { model: 'gpt-4o-mini-transcribe', language: o.language },
          turn_detection: { type: 'semantic_vad', eagerness: 'medium', create_response: true },
        },
        output: { voice: VOICE },
      },
    },
  });
  return { value: res.value, expiresAt: res.expires_at, model: REALTIME_MODEL };
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
