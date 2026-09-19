import { LEARNED_BOX } from '@/features/flashcards/lib/boxes';
import type { WordState } from '@/features/reading/data/types';

/**
 * How strongly a word is highlighted, from its Leitner box. This is why the document stores no
 * tint of its own: a text read again next week looks different because the learner is different.
 *
 * 0 is the strongest tint. A word with no card at all is new, which is the point of the text, so
 * it is tinted like a shaky one.
 */
export type Tier = 0 | 1 | 2;

export function tierOf(state: WordState | undefined): Tier {
  if (!state || state.box <= 2) return 0;
  return state.box < LEARNED_BOX ? 1 : 2;
}

/**
 * How sure the learner is of a word, as the word screen's "62 % sicher" pill. `reviews` counts
 * every answer and `lapses` the wrong ones, so the difference is the right ones. A card that has
 * never been answered has no percentage — "Neu" is the honest label, not "0 %".
 */
export function confidence(state: WordState | undefined): number | null {
  if (!state?.reviews) return null;
  return Math.round(((state.reviews - state.lapses) / state.reviews) * 100);
}
