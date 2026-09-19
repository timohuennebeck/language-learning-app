import type { Deck } from '@/features/flashcards/data/types';
import { delay } from '@/shared/lib/time';

/**
 * The cards due today, in the order they are handed to the deck. Same twelve cards as the dev
 * user's seed (`supabase/seed.sql`), boxes included, until the deck reads the real table.
 */
const dueToday: Deck = {
  id: 'cafe',
  cards: [
    { id: '1', front: 'à emporter', example: 'un café à emporter', back: 'zum Mitnehmen', box: 1 },
    {
      id: '2',
      front: 'l’addition',
      example: 'L’addition, s’il vous plaît.',
      back: 'die Rechnung',
      box: 1,
    },
    {
      id: '3',
      front: 'se débrouiller',
      example: 'Je me débrouille en français.',
      back: 'sich zurechtfinden',
      box: 1,
    },
    { id: '4', front: 'pourtant', example: 'Il pleut, pourtant je sors.', back: 'dennoch', box: 1 },
    {
      id: '5',
      front: 'le quartier',
      example: 'J’habite dans ce quartier.',
      back: 'das Viertel',
      box: 2,
    },
    {
      id: '6',
      front: 'le rendez-vous',
      example: 'J’ai un rendez-vous à midi.',
      back: 'der Termin',
      box: 2,
    },
    {
      id: '7',
      front: 'le trajet',
      example: 'Le trajet dure vingt minutes.',
      back: 'der Weg',
      box: 2,
    },
    { id: '8', front: 'déjà', example: 'Tu es déjà là ?', back: 'schon', box: 3 },
    { id: '9', front: 'le lait', example: 'un café avec du lait', back: 'die Milch', box: 3 },
    { id: '10', front: 'chaud', example: 'un café chaud', back: 'heiß', box: 4 },
    { id: '11', front: 'le café', example: 'un café, s’il vous plaît', back: 'der Kaffee', box: 4 },
    {
      id: '12',
      front: 's’il vous plaît',
      example: 'Un latte, s’il vous plaît.',
      back: 'bitte',
      box: 5,
    },
  ],
};

export async function getDeck(id: string): Promise<Deck> {
  await delay();
  return { ...dueToday, id };
}
