import { useQuery } from '@tanstack/react-query';

import { queries } from '@/shared/data/keys';

/** A finished call (topic, level, review) for the done screen. */
export function useConversation(id: string | undefined) {
  return useQuery({ ...queries.live.conversation(id ?? ''), enabled: Boolean(id) });
}
