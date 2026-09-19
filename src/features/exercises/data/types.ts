/** A run of text with an optional highlight ("mark") and footnote number, used in feedback lines. */
export interface Run {
  text: string;
  mark?: 'ok' | 'err';
  sup?: number;
}

interface Feedback {
  id: string;
  correctWhy: string;
}

/** Sentence steps: numbered explanations plus "Du" / "Richtig" lines on the wrong-answer card. */
interface SentenceStep extends Feedback {
  /** Numbered explanations shown under the wrong-answer comparison. */
  wrongWhy: string[];
  youLine: Run[];
  rightLine: Run[];
}

/** The gap sentence's German translation with the phrase the gap stands for. */
interface GapStep extends SentenceStep {
  pre: string;
  post: string;
  translation: string;
  /** Phrases of `translation` highlighted as what the gap asks for. */
  translationMarks: string[];
  answer: string;
}

export interface FillOptionsStep extends GapStep {
  kind: 'fill-options';
  options: string[];
  /** The distractor the design shows as the wrong pick. */
  wrongPick: string;
}

export interface FillFreeStep extends GapStep {
  kind: 'fill-free';
  hint: string;
  wrongTyped: string;
}

export interface BuildStep extends SentenceStep {
  kind: 'build';
  prompt: string;
  pool: string[];
  answer: string[];
  /** Pre-placed first piece in the task state (design shows one chip already dropped). */
  initial: string[];
  wrongOrder: string[];
  wrongPiece: string;
}

export interface TranslateFreeStep extends SentenceStep {
  kind: 'translate-free';
  prompt: string;
  hint: string;
  typedPartial: string;
  answer: string;
  wrongTyped: string;
  wrongTypedMark: string;
}

export interface ConjugateStep extends Feedback {
  kind: 'conjugate';
  verb: string;
  meaning: string;
  tense: string;
  pronouns: string[];
  /** One form per pronoun. */
  answer: string[];
  /** Design sample of a table in progress (dev / screenshot verification only). */
  typedPartial: string[];
  /** Design sample of a wrong table (dev / screenshot verification only). */
  wrongTyped: string[];
  /** One explanation per pronoun, shown (numbered) for the rows that were wrong. */
  rowWhy: string[];
}

export type ExerciseStep =
  FillOptionsStep | FillFreeStep | BuildStep | TranslateFreeStep | ConjugateStep;

export interface ExerciseSession {
  id: string;
  steps: ExerciseStep[];
}
