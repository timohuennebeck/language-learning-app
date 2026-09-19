import { Constants, type Enums } from '@/shared/lib/database.types';
import { type AppLanguage } from '@/shared/lib/i18n';

/**
 * Languages that can be learned at launch. Mirrors `languages.learnable` in the database; the
 * pickers render from this list and the seed keeps both in sync.
 */
export const LEARNING_LANGUAGES = ['fr', 'en', 'es'] as const;
/** Languages announced as coming soon (shown disabled in the pickers). */
export const UPCOMING_LEARNING_LANGUAGES = ['de', 'it', 'pt'] as const;
export type LearningLanguage = (typeof LEARNING_LANGUAGES)[number];

export function isLearningLanguage(value: unknown): value is LearningLanguage {
  return LEARNING_LANGUAGES.includes(value as LearningLanguage);
}

/** The app covers A1–B2 only; C1/C2 are out of scope everywhere (mirrors the `cefr_level` enum). */
export const LEVELS = Constants.public.Enums.cefr_level;
export type Level = Enums<'cefr_level'>;

/** "Warum lernst du …?" options (mirrors the `learning_goal` enum). */
export type LearningGoal = Enums<'learning_goal'>;
/** Where a level came from: chosen on 06a or measured by the placement call. */
export type LevelSource = Enums<'level_source'>;

/** Reminder repeat, in the order of the "Wiederholen" segments: Täglich / Mo–Fr / Wochenende. */
export const REMINDER_REPEATS = ['daily', 'weekdays', 'weekend'] as const;

export interface Reminder {
  hour: number;
  minute: number;
  /** Index into REMINDER_REPEATS. */
  repeat: number;
}

/**
 * What the screens read: the Supabase user plus `profiles` and the active `learner_languages`
 * row, flattened. Written back through `useSession().update()`.
 */
export interface Session {
  userId: string | null;
  email: string | null;
  /** Anonymous until the account step converts the user (email/password or a provider). */
  isAnonymous: boolean;
  onboardingComplete: boolean;
  name: string;
  /** Object path of the profile picture in the `avatars` bucket; null while none was chosen. */
  avatarPath: string | null;
  appLanguage: AppLanguage;
  learningLanguage: LearningLanguage;
  level: Level;
  levelSource: LevelSource;
  targetLevel: Level;
  /** Result of the reading placement (kept in memory until the call's level combines with it). */
  readingLevel: Level | null;
  dailyGoalMinutes: number;
  reminder: Reminder | null;
  goal: LearningGoal | null;
  /** Comes from RevenueCat later; true so the settings screen matches the design until then. */
  plusActive: boolean;
}

export const DEFAULT_SESSION: Session = {
  userId: null,
  email: null,
  isAnonymous: true,
  onboardingComplete: false,
  name: '',
  avatarPath: null,
  appLanguage: 'de',
  learningLanguage: 'fr',
  level: 'A2',
  levelSource: 'self',
  targetLevel: 'B2',
  readingLevel: null,
  dailyGoalMinutes: 15,
  reminder: { hour: 20, minute: 30, repeat: 0 },
  goal: 'media',
  plusActive: true,
};

/** A cached session from AsyncStorage: unknown keys are dropped, missing ones take the defaults. */
export function parseCachedSession(raw: unknown): Session | null {
  if (!raw || typeof raw !== 'object') return null;
  const cached = raw as Partial<Session>;
  const next = { ...DEFAULT_SESSION };
  for (const key of Object.keys(DEFAULT_SESSION) as (keyof Session)[]) {
    if (key in cached) (next as Record<string, unknown>)[key] = cached[key];
  }
  return next;
}
