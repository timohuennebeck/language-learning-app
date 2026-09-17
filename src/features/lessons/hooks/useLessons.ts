import { useQuery } from '@tanstack/react-query';

import { queries } from '@/shared/data/keys';

export function useHomeFeed() {
  return useQuery(queries.lessons.home);
}

export function useLesson(id: string) {
  return useQuery(queries.lessons.detail(id));
}

export function useChapter(id: string) {
  return useQuery(queries.lessons.chapter(id));
}
