import { z } from 'zod';

/** A run of text with an optional highlight ("mark") and footnote number, used in feedback lines. */
const RunSchema = z.object({
  text: z.string(),
  mark: z.enum(['ok', 'err']).optional(),
  sup: z.number().int().optional(),
});
export type Run = z.infer<typeof RunSchema>;

const Feedback = z.object({
  id: z.string(),
  correctWhy: z.string(),
});

/** Sentence steps: numbered explanations plus "Du" / "Richtig" lines on the wrong-answer card. */
const Base = Feedback.extend({
  /** Numbered explanations shown under the wrong-answer comparison. */
  wrongWhy: z.array(z.string()),
  youLine: z.array(RunSchema),
  rightLine: z.array(RunSchema),
});

/** The gap sentence's German translation with the phrase the gap stands for. */
const Gap = Base.extend({
  pre: z.string(),
  post: z.string(),
  translation: z.string(),
  /** Phrases of `translation` highlighted as what the gap asks for. */
  translationMarks: z.array(z.string()),
  answer: z.string(),
});

const ExerciseStepSchema = z.discriminatedUnion('kind', [
  Gap.extend({
    kind: z.literal('fill-options'),
    options: z.array(z.string()),
    /** The distractor the design shows as the wrong pick. */
    wrongPick: z.string(),
  }),
  Gap.extend({
    kind: z.literal('fill-free'),
    hint: z.string(),
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
  Feedback.extend({
    kind: z.literal('conjugate'),
    verb: z.string(),
    meaning: z.string(),
    tense: z.string(),
    pronouns: z.array(z.string()),
    /** One form per pronoun. */
    answer: z.array(z.string()),
    /** Design sample of a table in progress (dev / screenshot verification only). */
    typedPartial: z.array(z.string()),
    /** Design sample of a wrong table (dev / screenshot verification only). */
    wrongTyped: z.array(z.string()),
    /** One explanation per pronoun, shown (numbered) for the rows that were wrong. */
    rowWhy: z.array(z.string()),
  }),
]);
export type ExerciseStep = z.infer<typeof ExerciseStepSchema>;

export const ExerciseSessionSchema = z.object({
  id: z.string(),
  steps: z.array(ExerciseStepSchema),
});
export type ExerciseSession = z.infer<typeof ExerciseSessionSchema>;
