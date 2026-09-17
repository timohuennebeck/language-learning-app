import { useQuery } from '@tanstack/react-query';

import { queries } from '@/shared/data/keys';

export function useDeck(id: string) {
  return useQuery(queries.flashcards.deck(id));
}
