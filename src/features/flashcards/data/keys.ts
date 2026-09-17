import { createQueryKeys } from '@lukemorales/query-key-factory';

import { getDeck, getDueCount } from '@/features/flashcards/data/repository';

export const flashcardKeys = createQueryKeys('flashcards', {
  deck: (deckId: string) => ({
    queryKey: [deckId],
    queryFn: () => getDeck(deckId),
  }),
  due: {
    queryKey: null,
    queryFn: () => getDueCount(),
  },
});
