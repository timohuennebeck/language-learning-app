export interface Flashcard {
  id: string;
  front: string;
  example: string;
  back: string;
  /** How often the card was swiped "again" before this session (drives the chip emphasis). */
  misses: number;
}

export interface Deck {
  id: string;
  cards: Flashcard[];
}

export interface RepeatCard {
  id: string;
  word: string;
  misses: number;
}

/** Outcome of one deck run, shown on the results screen. */
export interface DeckResult {
  total: number;
  known: number;
  /** Cards to repeat, with their accumulated miss count (this session included). */
  again: RepeatCard[];
  /** Number of repeat cards when the list above is only an excerpt (design sample). */
  againCount?: number;
}
