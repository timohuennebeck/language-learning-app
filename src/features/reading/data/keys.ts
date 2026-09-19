import { createQueryKeys } from '@lukemorales/query-key-factory';

import { getBundle, getOpenText, getText } from '@/features/reading/data/repository';

export const readingKeys = createQueryKeys('reading', {
  /** The row alone, polled by the preparing screen while the text is written. */
  text: (textId: string) => ({
    queryKey: [textId],
    queryFn: () => getText(textId),
  }),
  /** The document with its vocabulary and the learner's boxes. */
  bundle: (textId: string, nativeLanguage: string) => ({
    queryKey: [textId, nativeLanguage],
    queryFn: () => getBundle(textId, nativeLanguage),
  }),
  /** The unfinished text behind "Weiterlesen · Abschnitt 2 von 3" on the home card. */
  open: (userId: string, language: string) => ({
    queryKey: [userId, language],
    queryFn: () => getOpenText(userId, language),
  }),
});
