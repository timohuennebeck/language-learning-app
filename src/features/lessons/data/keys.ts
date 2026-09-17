import { createQueryKeys } from '@lukemorales/query-key-factory';

import { getChapter, getHomeFeed } from '@/features/lessons/data/repository';

export const lessonKeys = createQueryKeys('lessons', {
  chapter: (chapterId: string) => ({
    queryKey: [chapterId],
    queryFn: () => getChapter(chapterId),
  }),
  home: {
    queryKey: null,
    queryFn: () => getHomeFeed(),
  },
});
