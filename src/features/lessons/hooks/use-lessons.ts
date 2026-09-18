import { useQuery } from '@tanstack/react-query';

import { queries } from '@/shared/data/keys';

export function useHomeFeed() {
  return useQuery(queries.lessons.home);
}

export function useChapter(id: string) {
  return useQuery(queries.lessons.chapter(id));
}
