import { z } from 'zod';

import { SUPPORTED_APP_LANGUAGES } from '@/shared/lib/i18n';

/** Languages that can be learned today. More are listed under "Bald verfügbar" in the pickers. */
export const LearningLanguageSchema = z.enum(['fr']);
/** Languages announced as coming soon (shown disabled in the pickers). */
export const UPCOMING_LEARNING_LANGUAGES = ['en', 'es', 'de'] as const;
export type LearningLanguage = z.infer<typeof LearningLanguageSchema>;

/** The app covers A1–B2 only; C1/C2 are out of scope everywhere. */
const LevelSchema = z.enum(['A1', 'A2', 'B1', 'B2']);
export const LEVELS = LevelSchema.options;
export type Level = z.infer<typeof LevelSchema>;

/**
 * Local session state. This is a stand-in for the Supabase session + profile
 * that will replace it later; the shape is kept small on purpose.
 */
export const SessionSchema = z.object({
  onboardingComplete: z.boolean().default(false),
  name: z.string().default('Maja'),
  appLanguage: z.enum(SUPPORTED_APP_LANGUAGES).default('de'),
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
