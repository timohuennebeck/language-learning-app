import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

const sources = {
  click: require('@assets/sounds/click.wav'),
  correct: require('@assets/sounds/correct.wav'),
  incorrect: require('@assets/sounds/incorrect.wav'),
} as const;

export type SoundKind = keyof typeof sources;

const players: Partial<Record<SoundKind, AudioPlayer>> = {};
/** Kinds that have played at least once: those need a rewind before playing again. */
const played = new Set<SoundKind>();
let configured = false;

/**
 * Fire-and-forget UI sound (selection click, exercise result chimes). Players are created on first
 * use and reused. Sounds play through the iPhone's silent switch, like the spoken conversation
 * will, and mix with other audio. Best-effort, like `haptic()`: any failure is swallowed.
 */
export function playSound(kind: SoundKind): void {
  try {
    if (!configured) {
      configured = true;
      setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' }).catch(
        () => {},
      );
    }
    const player = (players[kind] ??= createAudioPlayer(sources[kind]));
    // Rewind only a player that has run before: seeking a fresh item makes AVFoundation log noise.
    if (played.has(kind)) player.seekTo(0).catch(() => {});
    played.add(kind);
    player.play();
  } catch {
    /* sounds are best-effort */
  }
}
