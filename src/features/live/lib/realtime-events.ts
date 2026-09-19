/** The slice of OpenAI Realtime server events the call listens to (data channel `oai-events`). */
export interface RealtimeServerEvent {
  type: string;
  /** `conversation.item.input_audio_transcription.completed` / `response.output_audio_transcript.done` */
  transcript?: string;
  /** `response.output_audio_transcript.delta` */
  delta?: string;
  /** `response.function_call_arguments.done` */
  call_id?: string;
  name?: string;
  arguments?: string;
  /** `response.done` */
  response?: { usage?: Record<string, unknown> };
  /** `error` */
  error?: { type?: string; code?: string; message?: string };
}

export interface RealtimeConnectionOptions {
  clientSecret: string;
  model: string;
  onEvent: (event: RealtimeServerEvent) => void;
  /** Fires when the peer connection drops for good (network loss, remote hang-up). */
  onDisconnect: () => void;
}

export interface RealtimeConnection {
  /** Sends a client event (`response.create`, `conversation.item.create`, …). */
  send: (event: Record<string, unknown>) => void;
  setMuted: (muted: boolean) => void;
  close: () => void;
}

export const CALLS_URL = 'https://api.openai.com/v1/realtime/calls';
export const EVENTS_CHANNEL = 'oai-events';

/** Exchanges the local SDP offer for the answer via the Realtime calls endpoint. */
export async function exchangeSdp(offerSdp: string, o: RealtimeConnectionOptions): Promise<string> {
  const res = await fetch(`${CALLS_URL}?model=${encodeURIComponent(o.model)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${o.clientSecret}`, 'Content-Type': 'application/sdp' },
    body: offerSdp,
  });
  if (!res.ok) throw new Error(`Realtime call setup failed (${res.status})`);
  return res.text();
}

export function parseEvent(raw: unknown): RealtimeServerEvent | null {
  if (typeof raw !== 'string') return null;
  try {
    const e = JSON.parse(raw) as RealtimeServerEvent;
    return typeof e.type === 'string' ? e : null;
  } catch {
    return null;
  }
}
