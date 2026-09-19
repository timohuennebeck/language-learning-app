import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSession } from '@/features/auth/hooks/use-session';
import { saveDeckRun } from '@/features/flashcards/data/repository';
import type { Flashcard } from '@/features/flashcards/data/types';
import { queries } from '@/shared/data/keys';

/** The cards due today in the language the user is learning. */
export function useDeck() {
  const { session } = useSession();
  return useQuery({
    ...queries.flashcards.due(session.userId ?? '', session.learningLanguage),
    enabled: !!session.userId,
  });
}

/** Number of cards waiting today (the home pill). */
export function useDueCount() {
  const { session } = useSession();
  return useQuery({
    ...queries.flashcards.dueCount(session.userId ?? '', session.learningLanguage),
    enabled: !!session.userId,
  });
}

/**
 * Writes a finished run back, then brings the two readers in line. The deck itself is only marked
 * stale (`refetchType: 'none'`), because the results screen still needs the cards it just went
 * through to name them; it reloads the next time it is opened. The count has no such reader, so
 * it refetches at once — otherwise the home pill keeps claiming cards that are no longer due,
 * since the home tab stays mounted underneath and a merely stale query never refetches by itself.
 */
export function useSaveRun() {
  const client = useQueryClient();
  const { session } = useSession();
  return useMutation({
    mutationFn: ({ cards, knownIds }: { cards: Flashcard[]; knownIds: Set<string> }) =>
      saveDeckRun(cards, knownIds),
    onSuccess: () => {
      void client.invalidateQueries({
        queryKey: queries.flashcards.due._def,
        refetchType: 'none',
      });
      void client.invalidateQueries({ queryKey: queries.flashcards.dueCount._def });
      if (session.userId) {
        void client.invalidateQueries({
          queryKey: queries.profile.progress(session.userId).queryKey,
        });
      }
    },
  });
}
