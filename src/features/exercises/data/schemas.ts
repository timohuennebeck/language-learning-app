import { z } from 'zod';

/** A run of text with an optional highlight ("mark") and footnote number, used in feedback lines. */
const RunSchema = z.object({
  text: z.string(),
  mark: z.enum(['ok', 'err']).optional(),
  sup: z.number().int().optional(),
});
export type Run = z.infer<typeof RunSchema>;

const Base = z.object({
  id: z.string(),
  correctWhy: z.string(),
  /** Numbered explanations shown under the wrong-answer comparison. */
  wrongWhy: z.array(z.string()),
  youLine: z.array(RunSchema),
  rightLine: z.array(RunSchema),
});

const ExerciseStepSchema = z.discriminatedUnion('kind', [
  Base.extend({
    kind: z.literal('fill-options'),
    pre: z.string(),
    post: z.string(),
    translation: z.string(),
    options: z.array(z.string()),
    answer: z.string(),
    /** The distractor the design shows as the wrong pick. */
    wrongPick: z.string(),
  }),
  Base.extend({
    kind: z.literal('fill-free'),
    pre: z.string(),
    post: z.string(),
    translation: z.string(),
    hint: z.string(),
    answer: z.string(),
    wrongTyped: z.string(),
  }),
  Base.extend({
    kind: z.literal('build'),
    prompt: z.string(),
    pool: z.array(z.string()),
    answer: z.array(z.string()),
    /** Pre-placed first piece in the task state (design shows one chip already dropped). */
    initial: z.array(z.string()),
    wrongOrder: z.array(z.string()),
    wrongPiece: z.string(),
  }),
  Base.extend({
    kind: z.literal('translate-free'),
    prompt: z.string(),
    hint: z.string(),
    typedPartial: z.string(),
    answer: z.string(),
    wrongTyped: z.string(),
    wrongTypedMark: z.string(),
  }),
]);
export type ExerciseStep = z.infer<typeof ExerciseStepSchema>;

export const ExerciseSessionSchema = z.object({
  id: z.string(),
  steps: z.array(ExerciseStepSchema),
});
export type ExerciseSession = z.infer<typeof ExerciseSessionSchema>;
