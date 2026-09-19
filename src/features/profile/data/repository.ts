import {
  ProfileSchema,
  ProgressSchema,
  type Profile,
  type Progress,
} from '@/features/profile/data/schemas';
import { supabase } from '@/shared/lib/supabase';

async function currentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Not signed in');
  return data.user.id;
}

export async function getProfile(): Promise<Profile> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Not signed in');
  const { data, error } = await supabase
    .from('profiles')
    .select('first_name, active_language, app_language, daily_goal_minutes, reminder_time')
    .eq('id', auth.user.id)
    .single();
  if (error) throw new Error(error.message);
  return ProfileSchema.parse({
    name: data.first_name,
    email: auth.user.email ?? '',
    plusActive: true, // RevenueCat later
    learningLanguage: data.active_language ?? 'fr',
    appLanguage: data.app_language,
    dailyGoalMinutes: data.daily_goal_minutes,
    reminderTime: data.reminder_time?.slice(0, 5) ?? '',
  });
}

export async function updateProfile(patch: Partial<Profile>): Promise<Profile> {
  const id = await currentUserId();
  const { error } = await supabase
    .from('profiles')
    .update({
      ...(patch.name !== undefined && { first_name: patch.name }),
      ...(patch.dailyGoalMinutes !== undefined && { daily_goal_minutes: patch.dailyGoalMinutes }),
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
  return getProfile();
}

/**
 * Words saved and talks held are real counts; streak, week strip and level progress stay at
 * the design's values until the Lernen plan adds activity tracking (docs/database-plan.md §8).
 */
export async function getProgress(): Promise<Progress> {
  const id = await currentUserId();
  const [{ data: profile }, words, talks, talksLast30] = await Promise.all([
    supabase.from('profiles').select('active_language').eq('id', id).single(),
    supabase.from('flashcards').select('id', { count: 'exact', head: true }).eq('user_id', id),
    supabase
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', id)
      .eq('status', 'ended'),
    supabase
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', id)
      .eq('status', 'ended')
      .gte('started_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ]);
  void profile;
  return ProgressSchema.parse({
    streakDays: 12,
    minutesToday: 6,
    week: [1, 1, 1, 1, 1, 0, 0],
    levelProgress: 0.62,
    wordsSaved: words.count ?? 0,
    wordsGoal: 100,
    talks: talks.count ?? 0,
    talksLast30: talksLast30.count ?? 0,
  });
}
