import { createQueryKeys } from '@lukemorales/query-key-factory';

import { getProgress } from '@/features/profile/data/repository';

export const profileKeys = createQueryKeys('profile', {
  progress: (userId: string) => ({
    queryKey: [userId],
    queryFn: () => getProgress(userId),
  }),
});
