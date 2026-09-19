import type { LearningLanguage } from '@/features/auth/data/types';
import type { Scenario, ScenarioTask } from '@/features/speak/data/types';
import type { Localized } from '@/shared/lib/i18n';
import type { Tables } from '@/shared/lib/database.types';
import { supabase } from '@/shared/lib/supabase';

const COLUMNS =
  'id, slug, language, title, theme, level_min, level_max, minutes, is_placement, illustration_storage_path, subtitle, brief, tasks, sort_order';

type Row = Pick<
  Tables<'scenarios'>,
  | 'id'
  | 'slug'
  | 'language'
  | 'title'
  | 'theme'
  | 'level_min'
  | 'level_max'
  | 'minutes'
  | 'is_placement'
  | 'illustration_storage_path'
  | 'subtitle'
  | 'brief'
  | 'tasks'
  | 'sort_order'
>;

function toScenario(row: Row): Scenario {
  const { data } = supabase.storage.from('scenarios').getPublicUrl(row.illustration_storage_path);
  return {
    id: row.id,
    slug: row.slug,
    language: row.language as LearningLanguage,
    title: row.title,
    theme: row.theme,
    levelMin: row.level_min,
    levelMax: row.level_max,
    minutes: row.minutes,
    illustrationUrl: data.publicUrl,
    isPlacement: row.is_placement,
    subtitle: row.subtitle as Localized,
    brief: row.brief as Localized,
    tasks: row.tasks as unknown as ScenarioTask[],
    sortOrder: row.sort_order,
  };
}

/** The active catalogue for one learning language, in display order. `pip_prompt` never leaves the server. */
export async function listScenarios(language: LearningLanguage): Promise<Scenario[]> {
  const { data, error } = await supabase
    .from('scenarios')
    .select(COLUMNS)
    .eq('language', language)
    .eq('active', true)
    .eq('is_placement', false)
    .order('sort_order');
  if (error) throw new Error(error.message);
  return data.map(toScenario);
}

export async function getScenario(slug: string, language: LearningLanguage): Promise<Scenario> {
  const { data, error } = await supabase
    .from('scenarios')
    .select(COLUMNS)
    .eq('slug', slug)
    .eq('language', language)
    .single();
  if (error) throw new Error(error.message);
  return toScenario(data);
}

/** The Einstufungsgespräch script for a language: five staged questions as tasks. */
export async function getPlacementScenario(language: LearningLanguage): Promise<Scenario> {
  const { data, error } = await supabase
    .from('scenarios')
    .select(COLUMNS)
    .eq('language', language)
    .eq('is_placement', true)
    .single();
  if (error) throw new Error(error.message);
  return toScenario(data);
}
