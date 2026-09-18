import { z } from 'zod';

export const FlashcardSchema = z.object({
  id: z.string(),
  front: z.string(),
  example: z.string(),
  back: z.string(),
  /** How often the card was swiped "again" before this session (drives the chip emphasis). */
  misses: z.number().int().default(0),
});
export type Flashcard = z.infer<typeof FlashcardSchema>;

export const DeckSchema = z.object({
  id: z.string(),
  cards: z.array(FlashcardSchema),
});
export type Deck = z.infer<typeof DeckSchema>;

/** Outcome of one deck run, shown on the results screen. */
export type DeckResult = {
  total: number;
  known: number;
  /** Cards to repeat, with their accumulated miss count (this session included). */
  again: { id: string; word: string; misses: number }[];
  /** Number of repeat cards when the list above is only an excerpt (design sample). */
  againCount?: number;
};
