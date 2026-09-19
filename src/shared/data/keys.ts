import { mergeQueryKeys } from '@lukemorales/query-key-factory';

import { flashcardKeys } from '@/features/flashcards/data/keys';
import { legalKeys } from '@/features/legal/data/keys';
import { lessonKeys } from '@/features/lessons/data/keys';
import { liveKeys } from '@/features/live/data/keys';
import { profileKeys } from '@/features/profile/data/keys';
import { readingKeys } from '@/features/reading/data/keys';
import { speakKeys } from '@/features/speak/data/keys';

/** Root query-key registry (query-key-factory). Add each feature's keys here. */
export const queries = mergeQueryKeys(
  lessonKeys,
  flashcardKeys,
  profileKeys,
  legalKeys,
  speakKeys,
  liveKeys,
  readingKeys,
);
