import { createQueryKeys } from '@lukemorales/query-key-factory';

import { getLegalDocument, type LegalDocKind } from '@/features/legal/data/repository';

export const legalKeys = createQueryKeys('legal', {
  document: (kind: LegalDocKind, locale: string) => ({
    queryKey: [kind, locale],
    queryFn: () => getLegalDocument(kind, locale),
  }),
});
