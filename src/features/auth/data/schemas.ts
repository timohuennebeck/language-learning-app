import { z } from 'zod';

import { SUPPORTED_APP_LANGUAGES } from '@/shared/lib/i18n';

/**
 * Languages that can be learned at launch. Mirrors `languages.learnable` in the database; the
 * pickers render from this list and the seed keeps both in sync.
 */
export const LearningLanguageSchema = z.enum(['fr', 'en', 'es']);
/** Languages announced as coming soon (shown disabled in the pickers). */
export const UPCOMING_LEARNING_LANGUAGES = ['de', 'it', 'pt'] as const;
export type LearningLanguage = z.infer<typeof LearningLanguageSchema>;

/** The app covers A1–B2 only; C1/C2 are out of scope everywhere. */
export const LevelSchema = z.enum(['A1', 'A2', 'B1', 'B2']);
export const LEVELS = LevelSchema.options;
export type Level = z.infer<typeof LevelSchema>;

/** "Warum lernst du …?" options (mirrors the `learning_goal` enum). */
export const LearningGoalSchema = z.enum(['travel', 'media', 'family', 'work', 'friends', 'fun']);
export type LearningGoal = z.infer<typeof LearningGoalSchema>;

/** Reminder repeat, in the order of the "Wiederholen" segments: Täglich / Mo–Fr / Wochenende. */
export const REMINDER_REPEATS = ['daily', 'weekdays', 'weekend'] as const;

export const ReminderSchema = z.object({
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
  /** Index into REMINDER_REPEATS. */
  repeat: z.number().int().min(0).max(2),
});
export type Reminder = z.infer<typeof ReminderSchema>;

/**
 * What the screens read: the Supabase user plus `profiles` and the active `learner_languages`
 * row, flattened. Written back through `useSession().update()`.
 */
export const SessionSchema = z.object({
  userId: z.string().nullable().default(null),
  email: z.string().nullable().default(null),
  /** Anonymous until the account step converts the user (email/password or a provider). */
  isAnonymous: z.boolean().default(true),
  onboardingComplete: z.boolean().default(false),
  name: z.string().default(''),
  appLanguage: z.enum(SUPPORTED_APP_LANGUAGES).default('de'),
  learningLanguage: LearningLanguageSchema.default('fr'),
  level: LevelSchema.default('A2'),
  targetLevel: LevelSchema.default('B2'),
  dailyGoalMinutes: z.number().int().default(15),
  reminder: ReminderSchema.nullable().default({ hour: 20, minute: 30, repeat: 0 }),
  goal: LearningGoalSchema.nullable().default('media'),
  /** Comes from RevenueCat later; true so the settings screen matches the design until then. */
  plusActive: z.boolean().default(true),
});
export type Session = z.infer<typeof SessionSchema>;

export const DEFAULT_SESSION: Session = SessionSchema.parse({});
