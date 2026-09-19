/**
 * The slice of the OpenAI Live API protocol the call uses. Server events arrive on the WebRTC
 * data channel `oai-events`; client events are sent on it as JSON.
 */
export interface LiveServerEvent {
  type: string;
  event_id?: string;
  /** `session.input_transcript.delta` / `session.output_transcript.delta` */
  delta?: string;
  start_ms?: number;
  end_ms?: number;
  /** `session.usage.updated` / `session.closed` */
  usage?: { seconds?: number };
  /** `session.closed` */
  reason?: string;
  /** `session.started` / `session.closed` */
  session?: { id?: string; expires_at?: number };
  /** `response.event`: a nested Responses streaming event from the delegated backend. */
  event?: LiveResponseEvent;
  delegation_id?: string | null;
  /** `error` */
  error?: { type?: string; code?: string; message?: string };
}

export interface LiveResponseEvent {
  type: string;
  item?: { type?: string; call_id?: string; name?: string; arguments?: string };
  response?: { usage?: Record<string, unknown> };
}

export type LiveClientEvent = Record<string, unknown>;

export interface LiveConnectionOptions {
  /** Trades the local SDP offer for the answer (the edge function creates the session). */
  exchangeSdp: (offer: string) => Promise<string>;
  onEvent: (event: LiveServerEvent) => void;
  /** Fires when the peer connection drops for good (network loss, remote hang-up). */
  onDisconnect: () => void;
}

export interface LiveConnection {
  send: (event: LiveClientEvent) => void;
  setMuted: (muted: boolean) => void;
  close: () => void;
}

export const EVENTS_CHANNEL = 'oai-events';
/** Whole setup (microphone, offer, edge function, answer, channel open) must finish within this. */
export const CONNECT_TIMEOUT_MS = 30_000;

export function parseEvent(raw: unknown): LiveServerEvent | null {
  if (typeof raw !== 'string') return null;
  try {
    const e = JSON.parse(raw) as LiveServerEvent;
    return typeof e.type === 'string' ? e : null;
  } catch {
    return null;
  }
}

/** The parts of a peer connection and data channel both transports (react-native-webrtc, browser) share. */
export interface PeerLike {
  connectionState: string;

  onconnectionstatechange: ((e: any) => void) | null;
  close: () => void;
}
export interface ChannelLike {
  readyState: string;
  // Handler parameters are typed `any` on purpose: the browser's RTCDataChannel and
  // react-native-webrtc declare different event classes, and only `data` is read.

  onmessage: ((e: any) => void) | null;
  onopen: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onclose: ((e: any) => void) | null;

  send: (data: string) => void;
  close: () => void;
}
export interface StreamLike {
  getAudioTracks: () => { enabled: boolean }[];
  getTracks: () => { stop: () => void }[];
}

/**
 * Wires the events, waits for the data channel to open (or the transport to fail) and returns
 * the connection handle. `release` closes everything the transport created.
 */
export async function finishConnection(
  pc: PeerLike,
  channel: ChannelLike,
  stream: StreamLike,
  o: LiveConnectionOptions,
  release: () => void,
): Promise<LiveConnection> {
  channel.onmessage = (e: { data?: unknown }) => {
    const event = parseEvent(e.data);
    if (event) o.onEvent(event);
  };
  await new Promise<void>((resolve, reject) => {
    const fail = (why: string) => reject(new Error(why));
    channel.onopen = () => resolve();
    channel.onerror = () => fail('Live data channel failed');
    channel.onclose = () => fail('Live data channel closed');
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed')
        fail('Live connection failed');
    };
    if (channel.readyState === 'open') resolve();
  });
  channel.onclose = () => o.onDisconnect();
  pc.onconnectionstatechange = () => {
    if (pc.connectionState === 'failed' || pc.connectionState === 'closed') o.onDisconnect();
  };
  return {
    send: (event) => {
      if (channel.readyState === 'open') channel.send(JSON.stringify(event));
    },
    setMuted: (muted) => {
      for (const track of stream.getAudioTracks()) track.enabled = !muted;
    },
    close: () => {
      channel.onclose = null;
      pc.onconnectionstatechange = null;
      release();
    },
  };
}
