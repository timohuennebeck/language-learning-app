import {
  EVENTS_CHANNEL,
  finishConnection,
  type LiveConnection,
  type LiveConnectionOptions,
} from '@/features/live/lib/live-protocol';

/** Browser WebRTC transport (Expo web / development in the browser). */
export async function connectLive(o: LiveConnectionOptions): Promise<LiveConnection> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const pc = new RTCPeerConnection();
  const audio = document.createElement('audio');
  audio.autoplay = true;
  const release = () => {
    for (const track of stream.getTracks()) track.stop();
    pc.close();
    audio.srcObject = null;
  };
  try {
    for (const track of stream.getAudioTracks()) pc.addTrack(track, stream);
    pc.ontrack = (e) => {
      audio.srcObject = e.streams[0] ?? null;
      void audio.play().catch(() => {});
    };
    const channel = pc.createDataChannel(EVENTS_CHANNEL);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    const answer = await o.exchangeSdp(offer.sdp ?? '');
    await pc.setRemoteDescription({ type: 'answer', sdp: answer });
    return await finishConnection(pc, channel, stream, o, () => {
      channel.close();
      release();
    });
  } catch (e) {
    release();
    throw e;
  }
}
