import type { Profile, Progress } from '@/features/profile/data/types';
import { supabase } from '@/shared/lib/supabase';

async function currentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Not signed in');
  return data.user;
}

export async function getProfile(): Promise<Profile> {
  const user = await currentUser();
  const { data, error } = await supabase
    .from('profiles')
    .select('goal_minutes')
    .eq('id', user.id)
    .single();
  if (error) throw new Error(error.message);
  return { email: user.email ?? '', dailyGoalMinutes: data.goal_minutes };
}

export async function updateProfile(patch: Partial<Profile>): Promise<Profile> {
  const user = await currentUser();
  if (patch.dailyGoalMinutes !== undefined) {
    const { error } = await supabase
      .from('profiles')
      .update({ goal_minutes: patch.dailyGoalMinutes })
      .eq('id', user.id);
    if (error) throw new Error(error.message);
  }
  return getProfile();
}

/** The design's progress values; also shown by the profile while the query is loading. */
export const DESIGN_PROGRESS: Progress = {
  streakDays: 12,
  minutesToday: 6,
  week: [1, 1, 1, 1, 1, 0, 0],
  levelProgress: 0.62,
  wordsSaved: 86,
  wordsGoal: 100,
  talks: 19,
};

/**
 * Words saved and talks held are real counts; streak, week strip and level progress stay at
 * the design's values until the Lernen plan adds activity tracking (docs/lernen-plan.md).
 */
export async function getProgress(): Promise<Progress> {
  const user = await currentUser();
  const [words, talks] = await Promise.all([
    supabase.from('flashcards').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'ended'),
  ]);
  return {
    ...DESIGN_PROGRESS,
    wordsSaved: words.count ?? 0,
    talks: talks.count ?? 0,
  };
}
