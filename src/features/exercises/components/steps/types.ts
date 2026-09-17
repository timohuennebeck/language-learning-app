import type { ExerciseStep } from '@/features/exercises/data/schemas';
import type { Phase } from '@/features/exercises/hooks/useExerciseSession';

/** Props shared by every exercise step renderer. */
export type StepProps<K extends ExerciseStep['kind'], A = string> = {
  step: Extract<ExerciseStep, { kind: K }>;
  phase: Phase;
  answer: A;
  setAnswer: (a: A) => void;
};
