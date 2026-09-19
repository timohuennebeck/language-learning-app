import type { LearningLanguage, Level } from '@/features/auth/data/types';

export interface Progress {
  streakDays: number;
  minutesToday: number;
  /** Mon..Sun: 0 = missed, 1 = done, 2 = today (pending) */
  week: number[];
  /** 0..1 */
  levelProgress: number;
  /** Flashcards that have reached the top Leitner boxes (see LEARNED_BOX). */
  cardsLearned: number;
  /** Flashcards answered in the last 30 days. */
  cardsLast30: number;
  /** Every flashcard the user owns; the denominator of the tile's ring. */
  cardsTotal: number;
  /** Conversations finished, ever and in the last 30 days. */
  talks: number;
  talksLast30: number;
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
