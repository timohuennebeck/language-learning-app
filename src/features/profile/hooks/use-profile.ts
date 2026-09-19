import { useQuery } from '@tanstack/react-query';

import { useSession } from '@/features/auth/hooks/use-session';
import { DESIGN_PROGRESS } from '@/features/profile/data/repository';
import { queries } from '@/shared/data/keys';

/** Progress for the signed-in user; the design's numbers stand in while it loads. */
export function useProgress() {
  const { session } = useSession();
  return useQuery({
    ...queries.profile.progress(session.userId ?? ''),
    enabled: Boolean(session.userId),
    placeholderData: DESIGN_PROGRESS,
  });
}
