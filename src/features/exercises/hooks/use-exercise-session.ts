import { useCallback, useMemo, useState } from 'react';

import type { ExerciseSession, ExerciseStep } from '@/features/exercises/data/schemas';

export type Phase = 'task' | 'correct' | 'wrong';

type Options = {
  initialIndex?: number;
  initialPhase?: Phase;
  /** Pre-fill free-text drafts with the design's sample input (dev / screenshot verification only). */
  designDrafts?: boolean;
};

/** Loose comparison for typed answers: case, surrounding whitespace and punctuation are ignored. */
function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[.,!?;:…]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function draftFor(s: ExerciseStep, p: Phase, designDrafts: boolean): string | string[] {
  if (s.kind === 'build')
    return p === 'wrong' ? s.wrongOrder : p === 'correct' ? s.answer : s.initial;
  if (s.kind === 'fill-options')
    return p === 'wrong' ? s.wrongPick : p === 'correct' ? s.answer : '';
  if (s.kind === 'fill-free')
    return p === 'wrong' ? s.wrongTyped : p === 'correct' || designDrafts ? s.answer : '';
  return p === 'wrong'
    ? s.wrongTyped
    : p === 'correct'
      ? s.answer
      : designDrafts
        ? s.typedPartial
        : '';
}

/** Drives an exercise session: current step, answer draft, evaluation, and progression. */
export function useExerciseSession(
  session: ExerciseSession,
  { initialIndex = 0, initialPhase = 'task', designDrafts = false }: Options = {},
) {
  const total = session.steps.length;
  const clamp = (i: number) => Math.max(0, Math.min(total - 1, Number.isFinite(i) ? i : 0));
  const [index, setIndex] = useState(clamp(initialIndex));
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const step = session.steps[index];
  const [answer, setAnswer] = useState<string | string[]>(() =>
    draftFor(step, initialPhase, designDrafts),
  );

  const canCheck =
    step.kind === 'build' ? (answer as string[]).length >= 1 : String(answer).trim().length > 0;

  const check = useCallback(() => {
    let ok = false;
    if (step.kind === 'build') ok = JSON.stringify(answer) === JSON.stringify(step.answer);
    else ok = typeof answer === 'string' && normalize(answer) === normalize(step.answer);
    setPhase(ok ? 'correct' : 'wrong');
    return ok;
  }, [answer, step]);

  const next = useCallback(() => {
    const i = index + 1;
    if (i >= total) return false;
    setIndex(i);
    setPhase('task');
    setAnswer(draftFor(session.steps[i], 'task', designDrafts));
    return true;
  }, [designDrafts, index, session.steps, total]);

  const reset = useCallback(
    () => setAnswer(draftFor(step, 'task', designDrafts)),
    [designDrafts, step],
  );

  return useMemo(
    () => ({ index, phase, step, total, answer, canCheck, setAnswer, check, next, reset }),
    [index, phase, step, total, answer, canCheck, check, next, reset],
  );
}
