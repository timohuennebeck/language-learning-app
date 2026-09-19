import type { Level } from '@/features/auth/data/types';

import a2 from './a2.json';
import b1 from './b1.json';
import b2 from './b2.json';

/** A yes/no comprehension question asked in the interface language. */
export interface PlacementQuestion {
  id: string;
  prompt: string;
  answer: boolean;
}

/** Pass rule: at most `maxTaps` unknown words and at least `minCorrect` right answers. */
export interface PlacementRule {
  maxTaps: number;
  minCorrect: number;
}

export interface PlacementText {
  id: string;
  level: Level;
  role: 'round1' | 'round2-harder' | 'round2-easier';
  language: string;
  wordCount: number;
  text: string;
  /** Three per text. */
  questions: PlacementQuestion[];
  /** Round 1 only: which text follows. */
  branch?: {
    harderIf: PlacementRule & { next: string };
    otherwise: { next: string };
  };
  /** Round 2 only: the reading level the round yields. */
  placement?: {
    passIf: PlacementRule & { readingLevel: Level };
    otherwise: { readingLevel: Level };
  };
}

const all = [b1, b2, a2] as PlacementText[];

/** Placement reading texts by id (French stories, German yes/no questions). */
export const placementTexts: Record<string, PlacementText> = Object.fromEntries(
  all.map((t) => [t.id, t]),
);
export const FIRST_PLACEMENT_TEXT = b1.id;

/** Does a round satisfy a rule? */
export function passes(rule: PlacementRule, taps: number, correct: number) {
  return taps <= rule.maxTaps && correct >= rule.minCorrect;
}
