import type { User } from '@supabase/supabase-js';

import {
  DEFAULT_SESSION,
  LearningGoalSchema,
  LearningLanguageSchema,
  LevelSchema,
  REMINDER_REPEATS,
  type Session,
} from '@/features/auth/data/schemas';
import { detectLanguage, isAppLanguage, type AppLanguage } from '@/shared/lib/i18n';
import type { Tables, TablesUpdate } from '@/shared/lib/database.types';
import { supabase } from '@/shared/lib/supabase';
import { formatTime } from '@/shared/lib/time';

type ProfileRow = Tables<'profiles'>;
type LearnerRow = Tables<'learner_languages'>;

/** The success branch of a Supabase response (PostgREST and Auth both return `{ data, error }` unions). */
type Ok<R> = R extends { error: null; data: infer D } ? D : never;

/** Throws the Supabase error so callers see exactly what failed; narrows to the success data. */
function unwrap<R extends { data: unknown; error: { message: string } | null }>(result: R): Ok<R> {
  if (result.error) throw new Error(result.error.message);
  return result.data as Ok<R>;
}

// Auth ---------------------------------------------------------------------------------------

/**
 * The app always has a user: the stored session if there is one, otherwise a fresh anonymous
 * sign-in (onboarding writes real rows from the first step, see docs/database-plan.md §2).
 */
export async function ensureUser(): Promise<User> {
  const { data } = await supabase.auth.getSession();
  if (data.session?.user) return data.session.user;
  const anon = unwrap(await supabase.auth.signInAnonymously());
  if (!anon.user) throw new Error('Anonymous sign-in returned no user');
  return anon.user;
}

/** Anonymous users get an email and a password; everyone else creates a new account. */
export async function signUpWithEmail(email: string, password: string): Promise<void> {
  const { data } = await supabase.auth.getUser();
  if (data.user?.is_anonymous) {
    unwrap(await supabase.auth.updateUser({ email, password }));
    return;
  }
  unwrap(await supabase.auth.signUp({ email, password }));
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  unwrap(await supabase.auth.signInWithPassword({ email, password }));
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

/** Calls the `delete-account` edge function (auth admin delete → every row cascades). */
export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.functions.invoke('delete-account');
  if (error) throw new Error(error.message);
  // The user is gone server-side; drop the local session without a network round-trip.
  await supabase.auth.signOut({ scope: 'local' });
}

// Profile ↔ Session ---------------------------------------------------------------------------

function toReminder(row: ProfileRow): Session['reminder'] {
  if (!row.reminder_time) return null;
  const [h, m] = row.reminder_time.split(':').map(Number);
  const repeat = Math.max(0, REMINDER_REPEATS.indexOf(row.reminder_repeat));
  return { hour: h ?? 20, minute: m ?? 30, repeat };
}

function toSession(user: User, profile: ProfileRow, learner: LearnerRow | null): Session {
  const learningLanguage = LearningLanguageSchema.safeParse(profile.active_language);
  return {
    userId: user.id,
    email: user.email ?? null,
    isAnonymous: !!user.is_anonymous,
    onboardingComplete: profile.onboarding_completed_at != null,
    name: profile.first_name,
    appLanguage: isAppLanguage(profile.app_language) ? profile.app_language : 'de',
    learningLanguage: learningLanguage.success
      ? learningLanguage.data
      : DEFAULT_SESSION.learningLanguage,
    level: learner ? LevelSchema.parse(learner.level) : DEFAULT_SESSION.level,
    targetLevel: learner ? LevelSchema.parse(learner.target_level) : DEFAULT_SESSION.targetLevel,
    dailyGoalMinutes: profile.goal_minutes,
    reminder: toReminder(profile),
    goal: learner ? LearningGoalSchema.nullable().parse(learner.goal) : DEFAULT_SESSION.goal,
    plusActive: DEFAULT_SESSION.plusActive,
  };
}

/**
 * Loads (and on first launch creates) the user's profile plus the active learner-language row.
 * The upsert runs on every cold start, so a profile can never be missing.
 */
export async function loadSession(user: User): Promise<Session> {
  const appLanguage: AppLanguage = detectLanguage();
  let profile = unwrap(await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle());
  if (!profile) {
    profile = unwrap(
      await supabase
        .from('profiles')
        .upsert({ id: user.id, app_language: appLanguage }, { onConflict: 'id' })
        .select('*')
        .single(),
    );
  }
  const learner = profile.active_language
    ? unwrap(
        await supabase
          .from('learner_languages')
          .select('*')
          .eq('user_id', user.id)
          .eq('language', profile.active_language)
          .maybeSingle(),
      )
    : null;
  return toSession(user, profile, learner);
}

/** Persists a `Session` patch: profile columns and, for level/target/goal, the learner row. */
export async function saveSession(next: Session, patch: Partial<Session>): Promise<void> {
  if (!next.userId) throw new Error('No user to save the session for');

  const profile: TablesUpdate<'profiles'> = {};
  if ('name' in patch) profile.first_name = next.name;
  if ('appLanguage' in patch) profile.app_language = next.appLanguage;
  if ('learningLanguage' in patch) profile.active_language = next.learningLanguage;
  if ('dailyGoalMinutes' in patch) profile.goal_minutes = next.dailyGoalMinutes;
  if ('reminder' in patch) {
    profile.reminder_time = next.reminder
      ? formatTime(next.reminder.hour, next.reminder.minute)
      : null;
    profile.reminder_repeat = REMINDER_REPEATS[next.reminder?.repeat ?? 0];
  }
  if ('onboardingComplete' in patch) {
    profile.onboarding_completed_at = next.onboardingComplete ? new Date().toISOString() : null;
  }
  if (Object.keys(profile).length) {
    unwrap(await supabase.from('profiles').update(profile).eq('id', next.userId));
  }

  const startsLanguage = 'learningLanguage' in patch;
  if (startsLanguage) {
    // First time on this language: create its row with the defaults; never overwrite progress.
    unwrap(
      await supabase
        .from('learner_languages')
        .upsert(
          { user_id: next.userId, language: next.learningLanguage },
          { onConflict: 'user_id,language', ignoreDuplicates: true },
        ),
    );
  }
  if ('level' in patch || 'targetLevel' in patch || 'goal' in patch) {
    unwrap(
      await supabase.from('learner_languages').upsert(
        {
          user_id: next.userId,
          language: next.learningLanguage,
          level: next.level,
          level_source: 'self',
          level_assessed_at: 'level' in patch ? new Date().toISOString() : undefined,
          target_level: next.targetLevel,
          goal: next.goal,
        },
        { onConflict: 'user_id,language' },
      ),
    );
  }
}
