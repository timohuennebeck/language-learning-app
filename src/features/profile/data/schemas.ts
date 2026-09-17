import { z } from 'zod';

export const ProfileSchema = z.object({
  name: z.string(),
  email: z.string(),
  plusActive: z.boolean(),
  learningLanguage: z.string(),
  appLanguage: z.string(),
  dailyGoalMinutes: z.number().int(),
  reminderTime: z.string(),
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
  talksLast30: z.number().int(),
});
export type Progress = z.infer<typeof ProgressSchema>;
