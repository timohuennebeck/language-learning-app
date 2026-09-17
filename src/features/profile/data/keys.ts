import { createQueryKeys } from '@lukemorales/query-key-factory';

import { getProfile, getProgress } from '@/features/profile/data/repository';

export const profileKeys = createQueryKeys('profile', {
  me: {
    queryKey: null,
    queryFn: () => getProfile(),
  },
  progress: {
    queryKey: null,
    queryFn: () => getProgress(),
  },
});
