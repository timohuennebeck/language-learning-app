import type { Deck } from '@/features/flashcards/data/types';
import { delay } from '@/shared/lib/time';

const cafeDeck: Deck = {
  id: 'cafe',
  cards: [
    {
      id: '1',
      front: 'à emporter',
      example: 'un café à emporter',
      back: 'zum Mitnehmen',
      misses: 3,
    },
    {
      id: '2',
      front: 'l’addition',
      example: 'L’addition, s’il vous plaît.',
      back: 'die Rechnung',
      misses: 1,
    },
    { id: '3', front: 'chaud', example: 'un café chaud', back: 'heiß', misses: 0 },
    { id: '4', front: 'le lait', example: 'avec du lait', back: 'die Milch', misses: 0 },
    {
      id: '5',
      front: 'le café',
      example: 'un café, s’il vous plaît',
      back: 'der Kaffee',
      misses: 0,
    },
    {
      id: '6',
      front: 's’il vous plaît',
      example: 'Un latte, s’il vous plaît.',
      back: 'bitte',
      misses: 0,
    },
  ],
};

export async function getDeck(id: string): Promise<Deck> {
  await delay();
  return { ...cafeDeck, id };
}
