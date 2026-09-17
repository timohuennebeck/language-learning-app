import { z } from 'zod';

export const LearningLanguageSchema = z.enum(['fr', 'en', 'es']);
export type LearningLanguage = z.infer<typeof LearningLanguageSchema>;

export const LevelSchema = z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
export type Level = z.infer<typeof LevelSchema>;

/**
 * Local session state. This is a stand-in for the Supabase session + profile
 * that will replace it later; the shape is kept small on purpose.
 */
export const SessionSchema = z.object({
  onboardingComplete: z.boolean().default(false),
  name: z.string().default('Maja'),
  appLanguage: z.enum(['de', 'en']).default('de'),
  learningLanguage: LearningLanguageSchema.default('fr'),
  level: LevelSchema.default('A2'),
  targetLevel: LevelSchema.default('B2'),
  dailyGoalMinutes: z.number().int().default(15),
  reminder: z
    .object({ hour: z.number().int(), minute: z.number().int(), repeat: z.number().int() })
    .nullable()
    .default({ hour: 20, minute: 30, repeat: 0 }),
  goal: z.string().nullable().default('media'),
  plusActive: z.boolean().default(true),
});
export type Session = z.infer<typeof SessionSchema>;

export const DEFAULT_SESSION: Session = SessionSchema.parse({});
