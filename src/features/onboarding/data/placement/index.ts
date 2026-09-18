import { z } from 'zod';

import { LevelSchema } from '@/features/auth/data/schemas';

import a2 from './a2.json';
import b1 from './b1.json';
import b2 from './b2.json';

/** A yes/no comprehension question asked in the interface language. */
const QuestionSchema = z.object({ id: z.string(), prompt: z.string(), answer: z.boolean() });

/** Pass rule: at most `maxTaps` unknown words and at least `minCorrect` right answers. */
const RuleSchema = z.object({ maxTaps: z.number().int(), minCorrect: z.number().int() });

export const PlacementTextSchema = z.object({
  id: z.string(),
  level: LevelSchema,
  role: z.enum(['round1', 'round2-harder', 'round2-easier']),
  language: z.string(),
  wordCount: z.number().int(),
  text: z.string(),
  questions: z.array(QuestionSchema).length(3),
  /** Round 1 only: which text follows. */
  branch: z
    .object({
      harderIf: RuleSchema.extend({ next: z.string() }),
      otherwise: z.object({ next: z.string() }),
    })
    .optional(),
  /** Round 2 only: the reading level the round yields. */
  placement: z
    .object({
      passIf: RuleSchema.extend({ readingLevel: LevelSchema }),
      otherwise: z.object({ readingLevel: LevelSchema }),
    })
    .optional(),
});
export type PlacementText = z.infer<typeof PlacementTextSchema>;

const all = [b1, b2, a2].map((t) => PlacementTextSchema.parse(t));

/** Placement reading texts by id (French stories, German yes/no questions). */
export const placementTexts: Record<string, PlacementText> = Object.fromEntries(
  all.map((t) => [t.id, t]),
);
export const FIRST_PLACEMENT_TEXT = b1.id;

/** Does a round satisfy a rule? */
export function passes(
  rule: { maxTaps: number; minCorrect: number },
  taps: number,
  correct: number,
) {
  return taps <= rule.maxTaps && correct >= rule.minCorrect;
}
