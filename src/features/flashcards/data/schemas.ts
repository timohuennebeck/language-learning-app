import { z } from 'zod';

export const FlashcardSchema = z.object({
  id: z.string(),
  front: z.string(),
  example: z.string(),
  back: z.string(),
});
export type Flashcard = z.infer<typeof FlashcardSchema>;

export const DeckSchema = z.object({
  id: z.string(),
  cards: z.array(FlashcardSchema),
});
export type Deck = z.infer<typeof DeckSchema>;
