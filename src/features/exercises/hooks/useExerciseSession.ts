import { useCallback, useMemo, useState } from 'react';

import type { ExerciseSession, ExerciseStep } from '@/features/exercises/data/schemas';

export type Phase = 'task' | 'correct' | 'wrong';

export type ExerciseState = {
  index: number;
  phase: Phase;
  step: ExerciseStep;
  total: number;
  /** Selected option (fill-options), typed text (free), or placed pieces (build). */
  answer: string | string[];
  last: boolean;
};

type Options = { initialIndex?: number; initialPhase?: Phase };

/** Drives an exercise session: current step, answer draft, evaluation, and progression. */
export function useExerciseSession(
  session: ExerciseSession,
  { initialIndex = 0, initialPhase = 'task' }: Options = {},
) {
  const total = session.steps.length;
  const clamp = (i: number) => Math.max(0, Math.min(total - 1, i));
  const [index, setIndex] = useState(clamp(initialIndex));
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const step = session.steps[index];

  const draftFor = useCallback((s: ExerciseStep, p: Phase): string | string[] => {
    if (s.kind === 'build')
      return p === 'wrong' ? s.wrongOrder : p === 'correct' ? s.answer : s.initial;
    if (s.kind === 'fill-options')
      return p === 'wrong' ? s.wrongPick : p === 'correct' ? s.answer : '';
    if (s.kind === 'fill-free') return p === 'wrong' ? s.wrongTyped : s.answer;
    return p === 'wrong' ? s.wrongTyped : p === 'correct' ? s.answer : s.typedPartial;
  }, []);
  const [answer, setAnswer] = useState<string | string[]>(() => draftFor(step, initialPhase));

  const check = useCallback(() => {
    let ok = false;
    if (step.kind === 'build') ok = JSON.stringify(answer) === JSON.stringify(step.answer);
    else {
      const a = typeof answer === 'string' ? answer.trim().toLowerCase() : '';
      ok = a === step.answer.toLowerCase();
    }
    setPhase(ok ? 'correct' : 'wrong');
    return ok;
  }, [answer, step]);

  const next = useCallback(() => {
    const i = index + 1;
    if (i >= total) return false;
    const s = session.steps[i];
    setIndex(i);
    setPhase('task');
    setAnswer(draftFor(s, 'task'));
    return true;
  }, [draftFor, index, session.steps, total]);

  const reset = useCallback(() => setAnswer(draftFor(step, 'task')), [draftFor, step]);

  return useMemo<
    ExerciseState & {
      setAnswer: typeof setAnswer;
      check: () => boolean;
      next: () => boolean;
      reset: () => void;
    }
  >(
    () => ({
      index,
      phase,
      step,
      total,
      answer,
      last: index === total - 1,
      setAnswer,
      check,
      next,
      reset,
    }),
    [index, phase, step, total, answer, check, next, reset],
  );
}
