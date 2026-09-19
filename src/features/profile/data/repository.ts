import type { Progress } from '@/features/profile/data/types';
import { supabase } from '@/shared/lib/supabase';

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
export async function getProgress(userId: string): Promise<Progress> {
  const [words, talks] = await Promise.all([
    supabase.from('flashcards').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'ended'),
  ]);
  return {
    ...DESIGN_PROGRESS,
    wordsSaved: words.count ?? 0,
    talks: talks.count ?? 0,
  };
}
