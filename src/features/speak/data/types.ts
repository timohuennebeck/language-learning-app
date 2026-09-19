import {
  LEVELS,
  type LearningGoal,
  type LearningLanguage,
  type Level,
} from '@/features/auth/data/types';
import { Constants, type Enums } from '@/shared/lib/database.types';

/** Strings keyed by app locale (`de`, `en`, …). */
export type Localized = Record<string, string>;

export const SCENARIO_THEMES = Constants.public.Enums.scenario_theme;
export type ScenarioTheme = Enums<'scenario_theme'>;

/** One thing to do in the talk. `text` is in the app language, `hint` in the learning language. */
export interface ScenarioTask {
  id: string;
  level?: Level;
  text: Localized;
  hint?: string;
}

export interface Scenario {
  id: string;
  /** Language-neutral situation id ('cafe'); the same across the three learning languages. */
  slug: string;
  language: LearningLanguage;
  /** In the learning language ("Au café"). */
  title: string;
  theme: ScenarioTheme;
  levelMin: Level;
  levelMax: Level;
  minutes: number;
  illustrationUrl: string;
  /** The Einstufungsgespräch: one per language, never listed on the Sprechen tab. */
  isPlacement: boolean;
  subtitle: Localized;
  brief: Localized;
  tasks: ScenarioTask[];
  sortOrder: number;
}

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
