import { createQueryKeys } from '@lukemorales/query-key-factory';

import { getLearnerLanguages, getProgress } from '@/features/profile/data/repository';

export const profileKeys = createQueryKeys('profile', {
  progress: (userId: string) => ({
    queryKey: [userId],
    queryFn: () => getProgress(userId),
  }),
  languages: (userId: string) => ({
    queryKey: [userId],
    queryFn: () => getLearnerLanguages(userId),
  }),
});
