import type { Deck, Flashcard } from '@/features/flashcards/data/types';
import { FIRST_BOX, dueAfter, promote, today } from '@/features/flashcards/lib/boxes';
import type { Tables } from '@/shared/lib/database.types';
import { supabase } from '@/shared/lib/supabase';

// `example` is no longer on the card, but every row the deck writes back carries it: the run is
// saved with an upsert, and a column left out of an upsert is written as null.
const COLUMNS =
  'id, user_id, language, lexeme_id, front, back, back_language, example, box, reviews, lapses';

/** Cards handed to one run. The rest waits for the next one. */
export const DECK_SIZE = 20;

type Row = Pick<
  Tables<'flashcards'>,
  | 'id'
  | 'user_id'
  | 'language'
  | 'lexeme_id'
  | 'front'
  | 'back'
  | 'back_language'
  | 'example'
  | 'box'
  | 'reviews'
  | 'lapses'
>;

function toCard(row: Row): Flashcard {
  return {
    id: row.id,
    userId: row.user_id,
    language: row.language,
    lexemeId: row.lexeme_id,
    front: row.front,
    back: row.back,
    backLanguage: row.back_language,
    example: row.example,
    box: row.box,
    reviews: row.reviews,
    lapses: row.lapses,
  };
}

/**
 * Everything due today, lowest box first: the cards the learner is shakiest on come up while
 * they are still fresh. A card that has never been seen is simply a box-1 card due today.
 */
export async function getDueDeck(userId: string, language: string): Promise<Deck> {
  const { data, error } = await supabase
    .from('flashcards')
    .select(COLUMNS)
    .eq('user_id', userId)
    .eq('language', language)
    .lte('due', today())
    .order('box')
    .order('due')
    .limit(DECK_SIZE);
  if (error) throw new Error(error.message);
  return { language, cards: data.map(toCard) };
}

/** How many cards are waiting today ("12 Karten fällig"), without loading them. */
export async function countDue(userId: string, language: string): Promise<number> {
  const { count, error } = await supabase
    .from('flashcards')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('language', language)
    .lte('due', today());
  if (error) throw new Error(error.message);
  return count ?? 0;
}

/**
 * Writes one run back in a single request: each card moves a box (or falls back to box 1) and
 * gets the day that box is due on. Upsert rather than an update per card — the rows exist, so
 * every one of them is an update, and the deck is one round trip instead of twenty.
 */
export async function saveDeckRun(cards: Flashcard[], knownIds: Set<string>): Promise<void> {
  const at = new Date();
  const rows = cards.map((card) => {
    const known = knownIds.has(card.id);
    const box = known ? promote(card.box) : FIRST_BOX;
    return {
      id: card.id,
      user_id: card.userId,
      language: card.language,
      lexeme_id: card.lexemeId,
      front: card.front,
      back: card.back,
      back_language: card.backLanguage,
      example: card.example,
      box,
      due: dueAfter(box, at),
      reviews: card.reviews + 1,
      lapses: card.lapses + (known ? 0 : 1),
      last_reviewed_at: at.toISOString(),
    };
  });
  const { error } = await supabase.from('flashcards').upsert(rows);
  if (error) throw new Error(error.message);
}
