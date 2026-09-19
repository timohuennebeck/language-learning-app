import type { ExerciseStep } from '@/features/exercises/data/schemas';

/**
 * Loose comparison for typed answers: case, surrounding whitespace and punctuation are ignored
 * and typographic apostrophes (iOS smart punctuation) count as straight ones.
 */
export function normalizeAnswer(s: string) {
  return s
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[.,!?;:…]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isSameAnswer(typed: string, expected: string) {
  return normalizeAnswer(typed) === normalizeAnswer(expected);
}

type Conjugate = Extract<ExerciseStep, { kind: 'conjugate' }>;

/** Indexes of the table rows whose typed form is wrong. */
export function wrongRows(step: Conjugate, forms: string[]) {
  return step.answer.flatMap((form, i) => (isSameAnswer(forms[i] ?? '', form) ? [] : [i]));
}

/** The explanations for the wrong rows, in table order (numbered on the feedback card). */
export function conjugateWrongWhy(step: Conjugate, forms: string[]) {
  return wrongRows(step, forms).map((i) => step.rowWhy[i]);
}
