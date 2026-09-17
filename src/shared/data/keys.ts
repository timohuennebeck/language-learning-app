import { mergeQueryKeys } from '@lukemorales/query-key-factory';

import { flashcardKeys } from '@/features/flashcards/data/keys';
import { lessonKeys } from '@/features/lessons/data/keys';
import { profileKeys } from '@/features/profile/data/keys';

/** Root query-key registry (query-key-factory). Add each feature's keys here. */
export const queries = mergeQueryKeys(lessonKeys, flashcardKeys, profileKeys);
