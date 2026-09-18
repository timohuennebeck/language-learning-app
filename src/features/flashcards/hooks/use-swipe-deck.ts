import { useState } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { Easing, runOnJS, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import type { Flashcard } from '@/features/flashcards/data/schemas';
import { haptic } from '@/shared/lib/haptics';

/** Horizontal drag distance (px) after which a released card flies out. */
const THRESHOLD = 110;
const FLY_DISTANCE = 520;

/** Swipe / flip state for a stack of flashcards: gestures, shared values and counters. */
export function useSwipeDeck(cards: Flashcard[]) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [again, setAgain] = useState(0);
  const dx = useSharedValue(0);
  const flip = useSharedValue(0);
  /** -1 / 1 while a card is flying out, 0 otherwise. Guards against double commits. */
  const leaving = useSharedValue(0);
  const flipping = useSharedValue(false);

  const card = cards[index];

  const commit = (dir: 1 | -1) => {
    haptic(dir > 0 ? 'success' : 'light');
    if (dir > 0) setKnown((k) => k + 1);
    else setAgain((a) => a + 1);
    setIndex((i) => i + 1);
    setFlipped(false);
    dx.value = 0;
    leaving.value = 0;
    flip.value = 0;
  };

  const flyOut = (dir: 1 | -1) => {
    if (leaving.value !== 0 || !card) return;
    leaving.value = dir;
    dx.value = withTiming(dir * FLY_DISTANCE, { duration: 260 }, () => runOnJS(commit)(dir));
  };

  const toggleFlip = () => setFlipped((f) => !f);
  const endFlip = () => {
    flipping.value = false;
  };

  const onFlip = () => {
    if (flipping.value || leaving.value !== 0) return;
    flipping.value = true;
    haptic('light');
    flip.value = withSequence(
      withTiming(90, { duration: 180, easing: Easing.out(Easing.ease) }, () =>
        runOnJS(toggleFlip)(),
      ),
      withTiming(-90, { duration: 0 }),
      withTiming(0, { duration: 180, easing: Easing.out(Easing.ease) }, () => runOnJS(endFlip)()),
    );
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (leaving.value === 0) dx.value = e.translationX;
    })
    .onEnd(() => {
      if (leaving.value !== 0) return;
      if (dx.value > THRESHOLD) runOnJS(flyOut)(1);
      else if (dx.value < -THRESHOLD) runOnJS(flyOut)(-1);
      else dx.value = withTiming(0, { duration: 260 });
    });
  const tap = Gesture.Tap().onEnd(() => runOnJS(onFlip)());
  const gesture = Gesture.Exclusive(pan, tap);

  const restart = () => {
    setIndex(0);
    setKnown(0);
    setAgain(0);
    setFlipped(false);
  };

  return { index, card, flipped, known, again, dx, flip, leaving, gesture, flyOut, restart };
}
