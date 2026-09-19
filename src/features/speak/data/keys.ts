import { createQueryKeys } from '@lukemorales/query-key-factory';

import type { LearningLanguage } from '@/features/auth/data/schemas';
import { getPlacementScenario, getScenario, listScenarios } from '@/features/speak/data/repository';

export const speakKeys = createQueryKeys('speak', {
  scenarios: (language: LearningLanguage) => ({
    queryKey: [language],
    queryFn: () => listScenarios(language),
  }),
  placement: (language: LearningLanguage) => ({
    queryKey: [language],
    queryFn: () => getPlacementScenario(language),
  }),
  scenario: (slug: string, language: LearningLanguage) => ({
    queryKey: [language, slug],
    queryFn: () => getScenario(slug, language),
  }),
});
