-- 0007 · scenarios (Sprechen tab), see docs/sprechen-plan.md

create type public.scenario_theme as enum ('life', 'travel', 'work', 'social', 'culture', 'food');

-- One row per situation (`key`) and learning language. Title, pip_prompt and task hints are in the
-- learning language; subtitle, brief and task texts are jsonb keyed by app locale.
create table public.scenarios (
  id                         uuid primary key default gen_random_uuid(),
  key                        text not null,
  language                   text not null references public.languages(code),
  title                      text not null,
  theme                      public.scenario_theme not null,
  level_min                  public.cefr_level not null default 'A1',
  level_max                  public.cefr_level not null default 'B2',
  minutes                    smallint not null default 5 check (minutes > 0),
  illustration_storage_path  text not null,
  subtitle                   jsonb not null default '{}',
  brief                      jsonb not null default '{}',
  tasks                      jsonb not null default '[]',
  pip_prompt                 text not null,
  sort_order                 smallint not null default 0,
  active                     boolean not null default true,
  unique (key, language)
);
create index scenarios_feed_idx on public.scenarios (language, active, sort_order);

alter table public.scenarios enable row level security;
create policy "scenarios are public" on public.scenarios for select to anon, authenticated using (true);

-- Completeness check: keys missing a learnable language, rows missing an app locale.
create view public.scenario_content_gaps with (security_invoker = true) as
with locales as (select code from public.languages where is_app_language),
     keys as (select distinct key from public.scenarios)
select k.key, l.code as language, 'missing variant' as gap
from keys k cross join (select code from public.languages where learnable) l
left join public.scenarios s on s.key = k.key and s.language = l.code
where s.id is null
union all
select s.key, s.language, 'subtitle lacks ' || loc.code
from public.scenarios s cross join locales loc
where not (s.subtitle ? loc.code)
union all
select s.key, s.language, 'brief lacks ' || loc.code
from public.scenarios s cross join locales loc
where not (s.brief ? loc.code)
union all
select s.key, s.language, 'task ' || (t ->> 'id') || ' lacks ' || loc.code
from public.scenarios s, jsonb_array_elements(s.tasks) t cross join locales loc
where not ((t -> 'text') ? loc.code);

-- A conversation can run a scenario.
alter type public.conversation_kind add value if not exists 'scenario';
alter table public.conversations
  add column scenario_id uuid references public.scenarios(id) on delete set null;

-- Public bucket for the illustrations (one file per key: scenarios/<key>.webp).
insert into storage.buckets (id, name, public) values ('scenarios', 'scenarios', true)
on conflict (id) do nothing;
create policy "scenario illustrations are public" on storage.objects
  for select to anon, authenticated using (bucket_id = 'scenarios');
