import { useQuery } from '@tanstack/react-query';

import type { LearningLanguage } from '@/features/auth/data/schemas';
import { queries } from '@/shared/data/keys';

/** The catalogue changes rarely: keep it for a day (docs/sprechen-plan.md §5). */
const CATALOGUE_STALE_MS = 24 * 60 * 60 * 1000;

export function useScenarios(language: LearningLanguage) {
  return useQuery({ ...queries.speak.scenarios(language), staleTime: CATALOGUE_STALE_MS });
}

export function useScenario(slug: string, language: LearningLanguage) {
  return useQuery({ ...queries.speak.scenario(slug, language), staleTime: CATALOGUE_STALE_MS });
}
