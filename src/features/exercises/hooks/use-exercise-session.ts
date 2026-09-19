import { useCallback, useMemo, useState } from 'react';

import type { ExerciseSession, ExerciseStep } from '@/features/exercises/data/schemas';
import { isSameAnswer, wrongRows } from '@/features/exercises/lib/answers';

export type Phase = 'task' | 'correct' | 'wrong';

type Options = {
  initialIndex?: number;
  initialPhase?: Phase;
  /** Pre-fill free-text drafts with the design's sample input (dev / screenshot verification only). */
  designDrafts?: boolean;
};

function draftFor(s: ExerciseStep, p: Phase, designDrafts: boolean): string | string[] {
  if (s.kind === 'conjugate')
    return p === 'wrong'
      ? s.wrongTyped
      : p === 'correct'
        ? s.answer
        : designDrafts
          ? s.typedPartial
          : s.pronouns.map(() => '');
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
  /** Ids of the steps answered wrongly so far. */
  const [wrongIds, setWrongIds] = useState<string[]>([]);

  const canCheck =
    step.kind === 'build'
      ? (answer as string[]).length >= 1
      : step.kind === 'conjugate'
        ? (answer as string[]).every((a) => a.trim().length > 0)
        : String(answer).trim().length > 0;

  const check = useCallback(() => {
    let ok = false;
    if (step.kind === 'build') ok = JSON.stringify(answer) === JSON.stringify(step.answer);
    else if (step.kind === 'conjugate') ok = wrongRows(step, answer as string[]).length === 0;
    else ok = typeof answer === 'string' && isSameAnswer(answer, step.answer);
    setPhase(ok ? 'correct' : 'wrong');
    if (!ok) setWrongIds((ids) => (ids.includes(step.id) ? ids : [...ids, step.id]));
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
    () => ({
      index,
      phase,
      step,
      total,
      answer,
      wrongIds,
      canCheck,
      setAnswer,
      check,
      next,
      reset,
    }),
    [index, phase, step, total, answer, wrongIds, canCheck, check, next, reset],
  );
}
