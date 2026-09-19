export interface Flashcard {
  id: string;
  userId: string;
  language: string;
  /** The word this card is about (`lexemes.id`); how a reading text finds this card. */
  lexemeId: string;
  front: string;
  back: string;
  backLanguage: string;
  example: string | null;
  /** Leitner box 1…6 the card is in right now (see lib/boxes.ts). */
  box: number;
  reviews: number;
  lapses: number;
}

export interface Deck {
  language: string;
  cards: Flashcard[];
}

export interface RepeatCard {
  id: string;
  word: string;
}

/** Outcome of one deck run, shown on the results screen. */
export interface DeckResult {
  total: number;
  known: number;
  /** Cards that went back to box 1. */
  again: RepeatCard[];
  /** Number of repeat cards when the list above is only an excerpt (design sample). */
  againCount?: number;
}
