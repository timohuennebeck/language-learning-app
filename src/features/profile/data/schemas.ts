import { z } from 'zod';

/** Server-side profile (mocked); the rest of the user state lives in the session for now. */
export const ProfileSchema = z.object({
  email: z.string(),
  dailyGoalMinutes: z.number().int(),
});
export type Profile = z.infer<typeof ProfileSchema>;

export const ProgressSchema = z.object({
  streakDays: z.number().int(),
  minutesToday: z.number().int(),
  /** Mon..Sun: 0 = missed, 1 = done, 2 = today (pending) */
  week: z.array(z.number().int().min(0).max(2)).length(7),
  levelProgress: z.number().min(0).max(1),
  wordsSaved: z.number().int(),
  wordsGoal: z.number().int(),
  talks: z.number().int(),
});
export type Progress = z.infer<typeof ProgressSchema>;
