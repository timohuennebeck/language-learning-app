export interface Flashcard {
  id: string;
  front: string;
  example: string;
  back: string;
  /** Leitner box 1…6 the card is in right now (see lib/boxes.ts). */
  box: number;
}

export interface Deck {
  id: string;
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
