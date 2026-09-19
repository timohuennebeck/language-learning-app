import { createQueryKeys } from '@lukemorales/query-key-factory';

import { countDue, getDueDeck } from '@/features/flashcards/data/repository';

export const flashcardKeys = createQueryKeys('flashcards', {
  due: (userId: string, language: string) => ({
    queryKey: [userId, language],
    queryFn: () => getDueDeck(userId, language),
  }),
  dueCount: (userId: string, language: string) => ({
    queryKey: [userId, language],
    queryFn: () => countDue(userId, language),
  }),
});
