import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { updateProfile } from '@/features/profile/data/repository';
import type { Profile } from '@/features/profile/data/schemas';
import { queries } from '@/shared/data/keys';

export function useProfile() {
  return useQuery(queries.profile.me);
}

export function useProgress() {
  return useQuery(queries.profile.progress);
}

/** Optimistic profile update: the UI reflects the change immediately and rolls back on error. */
export function useUpdateProfile() {
  const client = useQueryClient();
  const key = queries.profile.me.queryKey;
  return useMutation({
    mutationFn: (patch: Partial<Profile>) => updateProfile(patch),
    onMutate: async (patch) => {
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<Profile>(key);
      if (previous) client.setQueryData<Profile>(key, { ...previous, ...patch });
      return { previous };
    },
    onError: (_err, _patch, ctx) => {
      if (ctx?.previous) client.setQueryData(key, ctx.previous);
    },
    onSettled: () => client.invalidateQueries({ queryKey: key }),
  });
}
