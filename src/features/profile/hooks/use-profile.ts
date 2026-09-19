import { useQuery } from '@tanstack/react-query';

import { queries } from '@/shared/data/keys';

export function useProfile() {
  return useQuery(queries.profile.me);
}

export function useProgress() {
  return useQuery(queries.profile.progress);
}
