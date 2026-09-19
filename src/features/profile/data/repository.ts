import { isLearningLanguage } from '@/features/auth/data/types';
import type { LearnerLanguageSummary, Progress } from '@/features/profile/data/types';
import { supabase } from '@/shared/lib/supabase';

/** The window both profile tiles report on ("{{n}} in 30 Tagen"). */
const WINDOW_DAYS = 30;
/** Conversations included in a month of Plus; the denominator of the talks ring. */
export const MONTHLY_TALK_QUOTA = 30;

/**
 * Starting point for the profile query. The counts are zero on purpose: they are read from the
 * database below, and seeding them with the design's numbers made the tiles flash 86 / 19 before
 * snapping to the real values. Streak, week strip and level progress stay at the design's values
 * until the Lernen plan adds activity tracking (docs/lernen-plan.md).
 */
export const DESIGN_PROGRESS: Progress = {
  streakDays: 12,
  minutesToday: 6,
  week: [1, 1, 1, 1, 1, 0, 0],
  levelProgress: 0.62,
  cardsLearned: 0,
  cardsLast30: 0,
  cardsTotal: 0,
  talks: 0,
  talksLast30: 0,
};

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();

/**
 * The two profile tiles are real counts. "Karteikarten gelernt" counts cards that have been
 * through at least one review (`reps > 0`), against the whole deck; "Gespräche geführt" counts
 * finished calls, against the monthly quota. Both read zero until the feature writes rows, which
 * is the point: a ring that moves without a number behind it is a lie.
 */
export async function getProgress(userId: string): Promise<Progress> {
  const since = daysAgo(WINDOW_DAYS);
  const cards = () => supabase.from('flashcards').select('id', { count: 'exact', head: true });
  const talks = () =>
    supabase
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'ended');

  const [cardsTotal, cardsLearned, cardsLast30, talksTotal, talksLast30] = await Promise.all([
    cards().eq('user_id', userId),
    cards().eq('user_id', userId).gt('reps', 0),
    // `last_reviewed_at` makes this one row per card, so the count is cards and not reviews.
    cards().eq('user_id', userId).gte('last_reviewed_at', since),
    talks(),
    talks().gte('started_at', since),
  ]);

  return {
    ...DESIGN_PROGRESS,
    cardsTotal: cardsTotal.count ?? 0,
    cardsLearned: cardsLearned.count ?? 0,
    cardsLast30: cardsLast30.count ?? 0,
    talks: talksTotal.count ?? 0,
    talksLast30: talksLast30.count ?? 0,
  };
}

/** Every language the user has started, with the flashcards saved in each. */
export async function getLearnerLanguages(userId: string): Promise<LearnerLanguageSummary[]> {
  const [rows, cards] = await Promise.all([
    supabase
      .from('learner_languages')
      .select('language, level, target_level, started_at')
      .eq('user_id', userId)
      .order('started_at'),
    supabase.from('flashcards').select('language').eq('user_id', userId),
  ]);
  if (rows.error) throw new Error(rows.error.message);
  const words = new Map<string, number>();
  for (const c of cards.data ?? []) words.set(c.language, (words.get(c.language) ?? 0) + 1);
  return rows.data.flatMap((r) =>
    isLearningLanguage(r.language)
      ? [
          {
            language: r.language,
            level: r.level,
            targetLevel: r.target_level,
            words: words.get(r.language) ?? 0,
            startedAt: r.started_at,
          },
        ]
      : [],
  );
}
