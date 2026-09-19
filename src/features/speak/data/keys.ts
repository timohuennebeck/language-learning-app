import { createQueryKeys } from '@lukemorales/query-key-factory';

import type { LearningLanguage } from '@/features/auth/data/schemas';
import { getScenario, listScenarios } from '@/features/speak/data/repository';

export const speakKeys = createQueryKeys('speak', {
  scenarios: (language: LearningLanguage) => ({
    queryKey: [language],
    queryFn: () => listScenarios(language),
  }),
  scenario: (kind: string, language: LearningLanguage) => ({
    queryKey: [language, kind],
    queryFn: () => getScenario(kind, language),
  }),
});
