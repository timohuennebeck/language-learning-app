-- 0005 · conversations, flashcards, flashcard_reviews

-- Written only by the start-/end-conversation edge functions (service role); users read their own.
create table public.conversations (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.profiles(id) on delete cascade,
  language             text not null references public.languages(code),
  native_language      text not null references public.languages(code),
  kind                 public.conversation_kind not null,
  status               public.conversation_status not null default 'active',
  topic                text,
  level                public.cefr_level,
  provider             text not null default 'openai',
  model                text,
  provider_session_id  text,
  prompt_version       text,
  device_id            text,
  max_seconds          int not null default 360 check (max_seconds > 0),
  started_at           timestamptz not null default now(),
  ended_at             timestamptz,
  duration_seconds     int check (duration_seconds >= 0),
  end_reason           text check (end_reason in ('user', 'max_duration', 'error', 'abandoned')),
  transcript           jsonb,
  review               jsonb,
  usage                jsonb,
  created_at           timestamptz not null default now()
);
create index conversations_user_idx on public.conversations (user_id, started_at desc);
create index conversations_placement_device_idx on public.conversations (device_id, started_at desc)
  where kind = 'placement';

alter table public.learner_languages
  add column placement_conversation_id uuid references public.conversations(id) on delete set null;

-- The learner's vocabulary, scheduled with FSRS on the device (ts-fsrs). Columns after
-- `source_conversation_id` mirror the ts-fsrs Card type.
create table public.flashcards (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.profiles(id) on delete cascade,
  language                text not null references public.languages(code),
  front                   text not null,
  back                    text not null,
  back_language           text not null references public.languages(code),
  example                 text,
  source_conversation_id  uuid references public.conversations(id) on delete set null,
  due                     timestamptz not null default now(),
  stability               real not null default 0,
  difficulty              real not null default 0,
  state                   smallint not null default 0 check (state between 0 and 3),
  reps                    int not null default 0,
  lapses                  int not null default 0,
  scheduled_days          int not null default 0,
  elapsed_days            int not null default 0,
  learning_steps          smallint not null default 0,
  last_reviewed_at        timestamptz,
  created_at              timestamptz not null default now(),
  unique (user_id, language, front)
);
create index flashcards_due_idx on public.flashcards (user_id, language, due);

-- One row per swipe; never updated. Feeds the FSRS parameter optimiser later.
create table public.flashcard_reviews (
  id              bigint generated always as identity primary key,
  card_id         uuid not null references public.flashcards(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  rating          smallint not null check (rating between 1 and 4),
  state           smallint not null check (state between 0 and 3),
  stability       real not null,
  difficulty      real not null,
  elapsed_days    int not null,
  scheduled_days  int not null,
  reviewed_at     timestamptz not null default now()
);
create index flashcard_reviews_user_idx on public.flashcard_reviews (user_id, reviewed_at desc);
create index flashcard_reviews_card_idx on public.flashcard_reviews (card_id);

alter table public.conversations     enable row level security;
alter table public.flashcards        enable row level security;
alter table public.flashcard_reviews enable row level security;

create policy "own conversations: read" on public.conversations for select to authenticated using ((select auth.uid()) = user_id);
-- no client writes on conversations: the edge functions use the service role

create policy "own flashcards: read"   on public.flashcards for select to authenticated using ((select auth.uid()) = user_id);
create policy "own flashcards: insert" on public.flashcards for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own flashcards: update" on public.flashcards for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own flashcards: delete" on public.flashcards for delete to authenticated using ((select auth.uid()) = user_id);

create policy "own reviews: read"   on public.flashcard_reviews for select to authenticated using ((select auth.uid()) = user_id);
create policy "own reviews: insert" on public.flashcard_reviews for insert to authenticated with check ((select auth.uid()) = user_id);
