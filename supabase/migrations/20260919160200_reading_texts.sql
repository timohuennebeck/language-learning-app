-- 0018 · reading_texts: the generated Lesetext (docs/lesetext-plan.md §3)
--
-- One row per text. `content` is the whole document — prose, its translation, and spans that point
-- at `lexemes` by id — written once by `generate-reading` and read as a whole. No vocabulary lives
-- in it: an old text shows today's glosses and today's tints because it only stores references.

create type public.generation_status as enum ('generating', 'ready', 'failed');

create table public.reading_texts (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.profiles(id) on delete cascade,
  language                text not null references public.languages(code),
  native_language         text not null references public.languages(code),
  status                  public.generation_status not null default 'generating',
  stage                   smallint not null default 0 check (stage between 0 and 3),
  error_code              text,
  error                   text,
  source_conversation_id  uuid references public.conversations(id) on delete set null,
  level                   public.cefr_level not null,
  topic                   text,
  title                   text,
  draft                   jsonb,
  content                 jsonb,
  lexeme_ids              uuid[] not null default '{}',
  section_count           smallint,
  word_count              smallint,
  minutes                 smallint,
  writer_model            text,
  annotator_model         text,
  prompt_version          text,
  usage                   jsonb,
  attempts                smallint not null default 0,
  current_section         smallint not null default 1,
  completed_at            timestamptz,
  ready_at                timestamptz,
  created_at              timestamptz not null default now(),
  constraint reading_texts_section_range
    check (current_section >= 1 and (section_count is null or current_section <= section_count))
);

comment on column public.reading_texts.stage is
  'How far the generator got: 0 queued, 1 writing, 2 explaining, 3 done. Drives the checklist on the preparing screen, which polls this row.';
comment on column public.reading_texts.draft is
  'The writer pass output, kept so a retry after a failed annotator resumes here instead of paying for the prose again.';
comment on column public.reading_texts.content is
  'The document: { title, sections: [{ sentences: [{ id, source, native, spans }] }] }. A span is { at, len, lexeme, here, nativeMarks, mark } — `at`/`len` index `source` in UTF-16 code units.';
comment on column public.reading_texts.lexeme_ids is
  'Every lexeme the document references, so the screen can load the vocabulary and the learner''s boxes without parsing jsonb.';

create index reading_texts_user_idx on public.reading_texts (user_id, created_at desc);
-- "Weiterlesen · Abschnitt 2 von 3": the newest ready text the learner has not finished.
create index reading_texts_open_idx on public.reading_texts (user_id, language, created_at desc)
  where status = 'ready' and completed_at is null;
-- "Every text where this learner met `prendre`", without a table for it.
create index reading_texts_lexemes_idx on public.reading_texts using gin (lexeme_ids);
-- Two taps on the home card must not start two generations.
create unique index reading_texts_one_generating on public.reading_texts (user_id)
  where status = 'generating';

alter table public.reading_texts enable row level security;
create policy "own texts: read" on public.reading_texts
  for select to authenticated using ((select auth.uid()) = user_id);
-- No insert or update policy: rows are written by `generate-reading` with the secret key, and
-- progress goes through `mark_section_read` below. The client never writes this table.

-- Finishing a section. An RPC rather than a column grant: the server checks the section number
-- against the row, and it is the one place per-section side effects will land later
-- (`daily_activity.sections_read`, encounter counts) without the client gaining write access.
create or replace function public.mark_section_read(text_id uuid, section int)
returns void language plpgsql security definer set search_path = public as $$
declare
  t public.reading_texts%rowtype;
begin
  select * into t from public.reading_texts
    where id = text_id and user_id = (select auth.uid()) and status = 'ready';
  if not found then
    raise exception 'reading text not found' using errcode = 'P0002';
  end if;
  if section < 1 or section > t.section_count then
    raise exception 'section % out of range', section using errcode = '22003';
  end if;

  update public.reading_texts
    set current_section = greatest(current_section, least(section + 1, t.section_count)),
        completed_at = case
          when section = t.section_count then coalesce(completed_at, now())
          else completed_at
        end
    where id = text_id;
end $$;

revoke all on function public.mark_section_read(uuid, int) from public;
grant execute on function public.mark_section_read(uuid, int) to authenticated;

comment on function public.mark_section_read(uuid, int) is
  'Advances a reading text to the next section and stamps completed_at on the last one. The only write the client can make to reading_texts.';

-- How much the generators may spend per user per day; `generate-reading` counts today's rows with
-- status <> 'failed' and refuses with GENERATION_LIMIT.
insert into public.app_config (key, value, description) values
  ('daily_generation_limit', '{"reading_texts": 2, "exercise_sets": 2}',
   'Generations per user per day, per kind. Failed rows do not count; a separate hourly attempt ceiling stops retry loops.')
on conflict (key) do nothing;
