import { useQuery } from '@tanstack/react-query';

import type { LegalDocKind } from '@/features/legal/data/repository';
import { queries } from '@/shared/data/keys';

/** Current terms or privacy document in the given locale (English fallback). */
export function useLegalDocument(kind: LegalDocKind, locale: string) {
  return useQuery({ ...queries.legal.document(kind, locale), staleTime: 24 * 60 * 60 * 1000 });
}
