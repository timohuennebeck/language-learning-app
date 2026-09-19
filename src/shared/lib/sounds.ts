import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

const sources = {
  click: require('@assets/sounds/click.wav'),
  correct: require('@assets/sounds/correct.wav'),
  incorrect: require('@assets/sounds/incorrect.wav'),
} as const;

export type SoundKind = keyof typeof sources;

let configured = false;

/**
 * Fire-and-forget UI sound (selection click, exercise result chimes). Every call gets its own
 * short-lived player that is released when the sound ends, so a chime never has to be rewound
 * (an asynchronous seek before `play()` made every second one silent). Sounds play through the
 * iPhone's silent switch, like the spoken conversation will, and mix with other audio.
 * Best-effort, like `haptic()`: any failure is swallowed.
 */
export function playSound(kind: SoundKind): void {
  try {
    if (!configured) {
      configured = true;
      setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' }).catch(
        () => {},
      );
    }
    const player = createAudioPlayer(sources[kind]);
    const subscription = player.addListener('playbackStatusUpdate', (status) => {
      if (!status.didJustFinish) return;
      subscription.remove();
      player.remove();
    });
    player.play();
  } catch {
    /* sounds are best-effort */
  }
}
