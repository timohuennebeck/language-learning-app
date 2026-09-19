import { mediaDevices, RTCPeerConnection } from 'react-native-webrtc';

import {
  EVENTS_CHANNEL,
  finishConnection,
  type LiveConnection,
  type LiveConnectionOptions,
} from '@/features/live/lib/live-protocol';

/**
 * WebRTC transport for the live call on iOS / Android (react-native-webrtc). The microphone is
 * requested first, so a denied permission never creates a session. Remote audio plays through
 * the device automatically. Requires a development build (native module, see app.json plugins).
 */
export async function connectLive(o: LiveConnectionOptions): Promise<LiveConnection> {
  const stream = await mediaDevices.getUserMedia({ audio: true, video: false });
  const pc = new RTCPeerConnection({});
  const release = () => {
    for (const track of stream.getTracks()) track.stop();
    pc.close();
  };
  try {
    for (const track of stream.getAudioTracks()) pc.addTrack(track, stream);
    const channel = pc.createDataChannel(EVENTS_CHANNEL);
    const offer = (await pc.createOffer({})) as { sdp: string; type: 'offer' };
    await pc.setLocalDescription(offer);
    const answer = await o.exchangeSdp(offer.sdp);
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
