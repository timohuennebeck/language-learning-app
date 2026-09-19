import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { useSession } from '@/features/auth/hooks/use-session';
import {
  generateText,
  markSectionRead,
  saveWord,
  type ReadingError,
} from '@/features/reading/data/repository';
import type { Lexeme } from '@/features/reading/data/types';
import { queries } from '@/shared/data/keys';

/** Generation is done when the row says so; until then the preparing screen watches it. */
const POLL_MS = 1500;
/**
 * After this long a row still `generating` is treated as lost. It has to outlast the function's
 * own 90 s sweep, or the app gives up on a text that is still being written — which is exactly
 * what happened on the first real run: the server took 143 s and the screen sat at 45 s for ever,
 * because giving up stopped the polling without sending the learner anywhere.
 */
export const GIVE_UP_MS = 150_000;

/** A row the app should stop waiting for, whatever the server still thinks. */
export const isStale = (row: { status: string; createdAt: string }) =>
  row.status === 'generating' && Date.now() - new Date(row.createdAt).getTime() > GIVE_UP_MS;

/** Starts a text (or re-runs a failed one) and hands back the row id to watch. */
export function useGenerateText() {
  const client = useQueryClient();
  const { session } = useSession();
  return useMutation<string, ReadingError, { topic?: string; textId?: string } | void>({
    mutationFn: (input) => generateText({ language: session.learningLanguage, ...(input ?? {}) }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queries.reading.open._def });
    },
  });
}

/**
 * The row while it is being written. Polls until it is no longer `generating`, then stops — and
 * gives up after {@link GIVE_UP_MS} so a lost row does not poll for ever behind the checklist.
 */
export function useTextStatus(textId: string | undefined) {
  return useQuery({
    ...queries.reading.text(textId ?? ''),
    enabled: !!textId,
    refetchInterval: (query) => {
      const row = query.state.data;
      if (!row || row.status !== 'generating') return false;
      return isStale(row) ? false : POLL_MS;
    },
  });
}

/** The document, its vocabulary and the learner's boxes — everything the reading screen renders. */
export function useReadingBundle(textId: string | undefined) {
  const { session } = useSession();
  return useQuery({
    ...queries.reading.bundle(textId ?? '', session.appLanguage),
    enabled: !!textId,
  });
}

/** The unfinished text behind "Weiterlesen" on the home card. */
export function useOpenText() {
  const { session } = useSession();
  return useQuery({
    ...queries.reading.open(session.userId ?? '', session.learningLanguage),
    enabled: !!session.userId,
  });
}

/**
 * Finishing a section. The bundle is only marked stale rather than refetched: the screen is still
 * showing the text it just advanced, and re-reading the document mid-transition would flicker it.
 * The home card's query does refetch, because it has to stop saying "Abschnitt 2 von 3".
 */
export function useMarkSectionRead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ textId, section }: { textId: string; section: number }) =>
      markSectionRead(textId, section),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queries.reading.bundle._def, refetchType: 'none' });
      void client.invalidateQueries({ queryKey: queries.reading.open._def });
    },
  });
}

/**
 * "Speichern" on the word screen. The deck's readers are brought back in line so the new card
 * shows up in "12 Karten fällig" at once, and the text's tints follow on its next read.
 */
export function useSaveWord() {
  const client = useQueryClient();
  const { session } = useSession();
  return useMutation({
    mutationFn: (lexeme: Lexeme) =>
      saveWord({
        userId: session.userId!,
        language: session.learningLanguage,
        nativeLanguage: session.appLanguage,
        lexeme,
      }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queries.flashcards.dueCount._def });
      void client.invalidateQueries({ queryKey: queries.flashcards.due._def, refetchType: 'none' });
      void client.invalidateQueries({ queryKey: queries.reading.bundle._def, refetchType: 'none' });
    },
  });
}

/**
 * What every "Lesetext" entry point does: open the text the learner has not finished, or start a
 * new one and watch it being written. Four screens offer reading, and a second copy of this would
 * be the one that forgets to check for an unfinished text and burns a day's allowance.
 */
export function useOpenReading() {
  const router = useRouter();
  const { data: openText } = useOpenText();
  const { mutate, isPending } = useGenerateText();

  const start = useCallback(
    (topic?: string) => {
      if (openText) {
        router.push({ pathname: '/(app)/reading', params: { textId: openText.id } });
        return;
      }
      if (isPending) return;
      mutate(topic ? { topic } : undefined, {
        onSuccess: (textId) =>
          router.push({ pathname: '/(app)/reading/preparing', params: { textId } }),
        onError: () => router.push('/(app)/reading/error'),
      });
    },
    [openText, mutate, isPending, router],
  );

  return { start, openText, isStarting: isPending };
}
