import { createQueryKeys } from '@lukemorales/query-key-factory';

import { getChapter, getHomeFeed, getLesson, getLessons } from '@/features/lessons/data/repository';

export const lessonKeys = createQueryKeys('lessons', {
  all: null,
  list: {
    queryKey: null,
    queryFn: () => getLessons(),
  },
  detail: (lessonId: string) => ({
    queryKey: [lessonId],
    queryFn: () => getLesson(lessonId),
  }),
  chapter: (chapterId: string) => ({
    queryKey: [chapterId],
    queryFn: () => getChapter(chapterId),
  }),
  home: {
    queryKey: null,
    queryFn: () => getHomeFeed(),
  },
});
