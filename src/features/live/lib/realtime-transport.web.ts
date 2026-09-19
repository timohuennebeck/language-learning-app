import {
  EVENTS_CHANNEL,
  exchangeSdp,
  parseEvent,
  type RealtimeConnection,
  type RealtimeConnectionOptions,
} from '@/features/live/lib/realtime-events';

/** Browser WebRTC transport (Expo web / development in the browser). */
export async function connectRealtime(o: RealtimeConnectionOptions): Promise<RealtimeConnection> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const pc = new RTCPeerConnection();
  for (const track of stream.getAudioTracks()) pc.addTrack(track, stream);

  const audio = document.createElement('audio');
  audio.autoplay = true;
  pc.ontrack = (e) => {
    audio.srcObject = e.streams[0] ?? null;
    void audio.play().catch(() => {});
  };

  const channel = pc.createDataChannel(EVENTS_CHANNEL);
  channel.onmessage = (e) => {
    const event = parseEvent(e.data);
    if (event) o.onEvent(event);
  };
  pc.onconnectionstatechange = () => {
    if (pc.connectionState === 'failed' || pc.connectionState === 'closed') o.onDisconnect();
  };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  const answer = await exchangeSdp(offer.sdp ?? '', o);
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
      audio.srcObject = null;
    },
  };
}
