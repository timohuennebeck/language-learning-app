import { colors } from '@/shared/theme/tokens';

/** Space between the progress bar and a step's kicker; identical in every step and phase. */
export const STEP_TOP = 26;

/** The gap sentence of the fill steps: one size for the task and the result so nothing jumps. */
export const SENTENCE = {
  fontSize: 28,
  lineHeight: 39.2,
  letterSpacing: -0.56,
  color: colors.ink,
} as const;

/** The German prompt of the translate steps. */
export const PROMPT = { fontSize: 22, lineHeight: 30.8, color: colors.ink } as const;
