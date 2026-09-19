import type { LearningLanguage } from '@/features/auth/data/schemas';
import { ScenarioSchema, type Scenario } from '@/features/speak/data/schemas';
import type { Tables } from '@/shared/lib/database.types';
import { supabase } from '@/shared/lib/supabase';

const COLUMNS =
  'id, key, language, title, theme, level_min, level_max, minutes, illustration_storage_path, subtitle, brief, tasks, sort_order';

type Row = Pick<
  Tables<'scenarios'>,
  | 'id'
  | 'key'
  | 'language'
  | 'title'
  | 'theme'
  | 'level_min'
  | 'level_max'
  | 'minutes'
  | 'illustration_storage_path'
  | 'subtitle'
  | 'brief'
  | 'tasks'
  | 'sort_order'
>;

function toScenario(row: Row): Scenario {
  const { data } = supabase.storage.from('scenarios').getPublicUrl(row.illustration_storage_path);
  return ScenarioSchema.parse({
    id: row.id,
    key: row.key,
    language: row.language,
    title: row.title,
    theme: row.theme,
    levelMin: row.level_min,
    levelMax: row.level_max,
    minutes: row.minutes,
    illustrationUrl: data.publicUrl,
    subtitle: row.subtitle,
    brief: row.brief,
    tasks: row.tasks,
    sortOrder: row.sort_order,
  });
}

/** The active catalogue for one learning language, in display order. `pip_prompt` never leaves the server. */
export async function listScenarios(language: LearningLanguage): Promise<Scenario[]> {
  const { data, error } = await supabase
    .from('scenarios')
    .select(COLUMNS)
    .eq('language', language)
    .eq('active', true)
    .order('sort_order');
  if (error) throw new Error(error.message);
  return data.map(toScenario);
}

export async function getScenario(key: string, language: LearningLanguage): Promise<Scenario> {
  const { data, error } = await supabase
    .from('scenarios')
    .select(COLUMNS)
    .eq('key', key)
    .eq('language', language)
    .single();
  if (error) throw new Error(error.message);
  return toScenario(data);
}
