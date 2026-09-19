import { createQueryKeys } from '@lukemorales/query-key-factory';

import { getConversation } from '@/features/live/data/repository';

export const liveKeys = createQueryKeys('live', {
  conversation: (id: string) => ({
    queryKey: [id],
    queryFn: () => getConversation(id),
  }),
});
