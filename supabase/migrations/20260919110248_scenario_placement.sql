-- 0010 · the placement call (Einstufungsgespräch) is a scenario too: one per learning language,
-- never listed on the Sprechen tab; its tasks are the five staged questions.
alter table public.scenarios add column is_placement boolean not null default false;
create unique index scenarios_placement_per_language_idx on public.scenarios (language) where is_placement;
