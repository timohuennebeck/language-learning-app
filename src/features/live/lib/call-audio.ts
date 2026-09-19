import { setAudioModeAsync } from 'expo-audio';

/**
 * Audio session for a live call.
 *
 * react-native-webrtc puts iOS into `playAndRecord` but leaves the route on the receiver
 * (earpiece), which is why the call is barely audible at full volume unless the phone is held
 * to the ear. `shouldRouteThroughEarpiece: false` adds `.defaultToSpeaker`, so Pip comes out of
 * the loudspeaker; `doNotMix` takes exclusive focus so nothing ducks the call.
 *
 * Both calls are best-effort: a failure here costs volume, never the call.
 */
export function enterCallAudio(): void {
  setAudioModeAsync({
    allowsRecording: true,
    shouldRouteThroughEarpiece: false,
    playsInSilentMode: true,
    interruptionMode: 'doNotMix',
  }).catch(() => {});
}

/** Back to the mode the UI sounds expect (see `shared/lib/sounds.ts`). */
export function leaveCallAudio(): void {
  setAudioModeAsync({
    allowsRecording: false,
    playsInSilentMode: true,
    interruptionMode: 'mixWithOthers',
  }).catch(() => {});
}
