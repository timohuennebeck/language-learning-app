-- 0003 · profiles and learner_languages
-- The app upserts its own profile right after sign-in (no auth trigger, see docs/database-plan.md §2).

create table public.profiles (
  id                       uuid primary key references auth.users(id) on delete cascade,
  first_name               text not null default '' check (char_length(first_name) <= 40),
  app_language             text not null default 'en' references public.languages(code),
  active_language          text references public.languages(code),
  daily_goal_minutes       smallint not null default 15 check (daily_goal_minutes in (5, 10, 15, 30)),
  reminder_time            time,
  reminder_repeat          public.reminder_repeat not null default 'daily',
  onboarding_completed_at  timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
create trigger handle_updated_at before update on public.profiles
  for each row execute function extensions.moddatetime(updated_at);

-- One row per language the user has started. `placement_conversation_id` is added in 0005.
create table public.learner_languages (
  user_id            uuid not null references public.profiles(id) on delete cascade,
  language           text not null references public.languages(code),
  level              public.cefr_level not null default 'A1',
  level_source       public.level_source not null default 'self',
  level_assessed_at  timestamptz,
  target_level       public.cefr_level not null default 'B1',
  goal               public.learning_goal,
  started_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  primary key (user_id, language)
);
create trigger handle_updated_at before update on public.learner_languages
  for each row execute function extensions.moddatetime(updated_at);

alter table public.profiles          enable row level security;
alter table public.learner_languages enable row level security;

create policy "own profile: read"   on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "own profile: insert" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "own profile: update" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
-- no delete policy: deleting the auth user cascades

create policy "own learner languages: read"   on public.learner_languages for select to authenticated using ((select auth.uid()) = user_id);
create policy "own learner languages: insert" on public.learner_languages for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own learner languages: update" on public.learner_languages for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own learner languages: delete" on public.learner_languages for delete to authenticated using ((select auth.uid()) = user_id);
