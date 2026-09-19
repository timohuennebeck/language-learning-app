import { mediaDevices, RTCPeerConnection } from 'react-native-webrtc';

import {
  EVENTS_CHANNEL,
  exchangeSdp,
  parseEvent,
  type RealtimeConnection,
  type RealtimeConnectionOptions,
} from '@/features/live/lib/realtime-events';

/**
 * WebRTC transport for the live call on iOS / Android (react-native-webrtc). Remote audio plays
 * through the device speaker automatically; the data channel carries the JSON events.
 * Requires a development build: the module is native (see app.json plugins).
 */
export async function connectRealtime(o: RealtimeConnectionOptions): Promise<RealtimeConnection> {
  const stream = await mediaDevices.getUserMedia({ audio: true, video: false });
  const pc = new RTCPeerConnection({});
  for (const track of stream.getAudioTracks()) pc.addTrack(track, stream);

  const channel = pc.createDataChannel(EVENTS_CHANNEL);
  channel.onmessage = (e: { data?: unknown }) => {
    const event = parseEvent(e.data);
    if (event) o.onEvent(event);
  };
  pc.onconnectionstatechange = () => {
    if (pc.connectionState === 'failed' || pc.connectionState === 'closed') o.onDisconnect();
  };

  const offer = (await pc.createOffer({})) as { sdp: string; type: 'offer' };
  await pc.setLocalDescription(offer);
  const answer = await exchangeSdp(offer.sdp, o);
  await pc.setRemoteDescription({ type: 'answer', sdp: answer });
  await new Promise<void>((resolve, reject) => {
    if (channel.readyState === 'open') return resolve();
    channel.onopen = () => resolve();
    channel.onerror = () => reject(new Error('Realtime data channel failed'));
  });

  return {
    send: (event) => {
      if (channel.readyState === 'open') channel.send(JSON.stringify(event));
    },
    setMuted: (muted) => {
      for (const track of stream.getAudioTracks()) track.enabled = !muted;
    },
    close: () => {
      for (const track of stream.getTracks()) track.stop();
      channel.close();
      pc.close();
    },
  };
}
