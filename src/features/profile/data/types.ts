import type { LearningLanguage, Level } from '@/features/auth/data/types';

export interface Progress {
  streakDays: number;
  minutesToday: number;
  /** Mon..Sun: 0 = missed, 1 = done, 2 = today (pending) */
  week: number[];
  /** 0..1 */
  levelProgress: number;
  wordsSaved: number;
  wordsGoal: number;
  talks: number;
}

/** One row of `learner_languages` with the word count for the "Sprache wechseln" cards. */
export interface LearnerLanguageSummary {
  language: LearningLanguage;
  level: Level;
  targetLevel: Level;
  /** Flashcards saved in this language. */
  words: number;
  startedAt: string;
}
