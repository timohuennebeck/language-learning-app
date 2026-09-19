import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

const sources = {
  click: require('@assets/sounds/click.wav'),
  correct: require('@assets/sounds/correct.wav'),
  incorrect: require('@assets/sounds/incorrect.wav'),
} as const;

export type SoundKind = keyof typeof sources;

const players: Partial<Record<SoundKind, AudioPlayer>> = {};
let configured = false;

/**
 * Fire-and-forget UI sound (selection click, exercise result chimes). Players are created on first use and
 * reused; playback respects the silent switch and mixes with other audio. Best-effort, like
 * `haptic()`: any failure is swallowed.
 */
export function playSound(kind: SoundKind): void {
  try {
    if (!configured) {
      configured = true;
      setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(
        () => {},
      );
    }
    const player = (players[kind] ??= createAudioPlayer(sources[kind]));
    player.seekTo(0).catch(() => {});
    player.play();
  } catch {
    /* sounds are best-effort */
  }
}
