import { z } from 'zod';

import {
  LearningLanguageSchema,
  LEVELS,
  LevelSchema,
  type LearningGoal,
  type Level,
} from '@/features/auth/data/schemas';
import { Constants } from '@/shared/lib/database.types';

/** Strings keyed by app locale (`de`, `en`, …). */
export const LocalizedSchema = z.record(z.string(), z.string());
export type Localized = z.infer<typeof LocalizedSchema>;

export const ScenarioThemeSchema = z.enum(Constants.public.Enums.scenario_theme);
export type ScenarioTheme = z.infer<typeof ScenarioThemeSchema>;

/** One thing to do in the talk. `text` is in the app language, `hint` in the learning language. */
export const ScenarioTaskSchema = z.object({
  id: z.string(),
  level: LevelSchema.optional(),
  text: LocalizedSchema,
  hint: z.string().optional(),
});
export type ScenarioTask = z.infer<typeof ScenarioTaskSchema>;

export const ScenarioSchema = z.object({
  id: z.string(),
  key: z.string(),
  language: LearningLanguageSchema,
  /** In the learning language ("Au café"). */
  title: z.string(),
  theme: ScenarioThemeSchema,
  levelMin: LevelSchema,
  levelMax: LevelSchema,
  minutes: z.number().int(),
  illustrationUrl: z.string(),
  subtitle: LocalizedSchema,
  brief: LocalizedSchema,
  tasks: z.array(ScenarioTaskSchema),
  sortOrder: z.number().int(),
});
export type Scenario = z.infer<typeof ScenarioSchema>;

/** Picks the app-language string, falling back to English, then to whatever exists. */
export function localized(map: Localized, locale: string): string {
  return map[locale] ?? map.en ?? Object.values(map)[0] ?? '';
}

const rank = (level: Level) => LEVELS.indexOf(level);

/** Whether the learner's level falls inside the scenario's window. */
export function fitsLevel(scenario: Scenario, level: Level): boolean {
  return rank(level) >= rank(scenario.levelMin) && rank(level) <= rank(scenario.levelMax);
}

/** Tasks shown for a level: those without a level, plus those at or below it. */
export function tasksForLevel(scenario: Scenario, level: Level): ScenarioTask[] {
  return scenario.tasks.filter((t) => !t.level || rank(t.level) <= rank(level));
}

/** "Für dich": the theme that matches the onboarding goal (docs/sprechen-plan.md §1). */
export function themeForGoal(goal: LearningGoal | null): ScenarioTheme | null {
  switch (goal) {
    case 'travel':
      return 'travel';
    case 'media':
      return 'culture';
    case 'friends':
      return 'social';
    case 'work':
      return 'work';
    case 'family':
    case 'fun':
      return 'life';
    default:
      return null;
  }
}
