import { useState } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, withTiming } from 'react-native-reanimated';

import type { Flashcard } from '@/features/flashcards/data/types';
import { haptic } from '@/shared/lib/haptics';

/** Horizontal drag distance (px) after which a released card flies out. */
const THRESHOLD = 110;
const FLY_DISTANCE = 520;

/** Swipe / flip state for a stack of flashcards: gestures, shared values and counters. */
interface Outcome {
  known: number;
  againIds: string[];
}

export function useSwipeDeck(cards: Flashcard[], onFinish?: (outcome: Outcome) => void) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [againIds, setAgainIds] = useState<string[]>([]);
  const dx = useSharedValue(0);
  /** -1 / 1 while a card is flying out, 0 otherwise. Guards against double commits. */
  const leaving = useSharedValue(0);

  const card = cards[index];

  const commit = (dir: 1 | -1) => {
    haptic(dir > 0 ? 'success' : 'light');
    const nextKnown = known + (dir > 0 ? 1 : 0);
    const nextAgain = dir > 0 ? againIds : [...againIds, cards[index].id];
    setKnown(nextKnown);
    setAgainIds(nextAgain);
    setIndex((i) => i + 1);
    if (index + 1 >= cards.length) onFinish?.({ known: nextKnown, againIds: nextAgain });
    setFlipped(false);
    dx.value = 0;
    leaving.value = 0;
  };

  const flyOut = (dir: 1 | -1) => {
    if (leaving.value !== 0 || !card) return;
    leaving.value = dir;
    dx.value = withTiming(dir * FLY_DISTANCE, { duration: 260 }, () => runOnJS(commit)(dir));
  };

  /** Tap shows the other side immediately; no turn animation. */
  const onFlip = () => {
    if (leaving.value !== 0) return;
    haptic('light');
    setFlipped((f) => !f);
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

  return { index, card, flipped, dx, leaving, gesture, flyOut };
}
