# Yori · Lernen plan (parked)

Companion to `docs/database-plan.md` and `docs/sprechen-plan.md`. Scope: the **Lernen** tab: the
generated carousel ("Lesetext erstellen", "Übung starten"), the flashcard deck and the streak
card. Parked until the Sprechen tab is built; nothing here is needed for scenarios.

Decisions carried over: Kurs is authored (zero generation); the carousel generates on tap, capped
per day and stored so replays are free; flashcards never call a model.

---

## 1 When a model is called, and how much

| Trigger                                                   | Produces                           | Counts against the daily cap |
| --------------------------------------------------------- | ---------------------------------- | ---------------------------- |
| `end-conversation` (every finished call)                  | review (words, paraphrases, tasks) | no                           |
| Home card "Text erstellen"                                | one reading text                   | yes                          |
| Home card "Übung starten"                                 | one exercise set                   | yes                          |
| "Übung wiederholen", "Weiterlesen", retry of a failed job | nothing (stored content)           | no                           |

`app_config` gains `daily_generation_limit` (default `{ "reading_texts": 2, "exercise_sets": 2 }`).
The generator counts the user's rows created today (local day) with `status <> 'failed'` and
refuses with `GENERATION_LIMIT` when the cap is reached; the app then offers the stored items. A
set plus a text is ~13k tokens, a few cents; with the cap, the worst case is well under a dollar
per user per month.

Inputs the generators read (server-side, the app sends only ids): level and native language; the
last finished conversation's `transcript` and `review` when one exists; the learner's last 20
wrong `exercise_attempts`; the fronts of the due `flashcards`. Without any conversation yet, the
text and the set are built from level, goal and the due words.

## 2 Job pattern

The app calls the function, which inserts the row with `status = 'generating'`, returns its id at
once, and finishes in the background. The app watches the row (Supabase Realtime on `id`, 20 s
timeout) behind "Pip baut deine Übung". `ready` opens the content; `failed` shows 01d with
"Nochmal versuchen", which re-runs the same row. Content is one jsonb document validated by the
existing content interfaces on the client. Rows are written by the functions (secret key); the user
reads their own rows and may update only the progress columns (column-level grants, B.6).

```sql
create type public.generation_status as enum ('generating', 'ready', 'failed');
```

## 3 Exercise sets

```sql
create table public.exercise_sets (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.profiles(id) on delete cascade,
  language                text not null references public.languages(code),
  native_language         text not null references public.languages(code),
  status                  public.generation_status not null default 'generating',
  error                   text,                                   -- "Fehler 503" on 01d
  source_conversation_id  uuid references public.conversations(id) on delete set null,
  level                   public.cefr_level not null,
  content                 jsonb,             -- { steps: ExerciseStep[] } (features/exercises/data/schemas.ts)
  step_count              smallint,          -- "5 Aufgaben" without parsing content
  model                   text,
  prompt_version          text,
  usage                   jsonb,
  current_step            smallint not null default 0,            -- progress, updated by the app
  completed_at            timestamptz,
  created_at              timestamptz not null default now()
);
create index exercise_sets_user_idx on public.exercise_sets (user_id, created_at desc);

-- One row per checked answer: the "Deine Fehler werden zu neuen Aufgaben" input.
create table public.exercise_attempts (
  id            bigint generated always as identity primary key,
  set_id        uuid not null references public.exercise_sets(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  step_id       text not null,                -- ExerciseStep.id inside content
  step_kind     text not null,                -- fill-options | fill-free | build | translate-free
  tag           text,                         -- free-text grammar tag from the step ('Passé composé') → Kurs maps it to grammar_forms
  correct       boolean not null,
  answer        text,                         -- what the user typed / built (open question 4)
  attempted_at  timestamptz not null default now()
);
create index exercise_attempts_user_idx on public.exercise_attempts (user_id, attempted_at desc);
```

## 4 Reading texts

```sql
create table public.reading_texts (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.profiles(id) on delete cascade,
  language                text not null references public.languages(code),
  native_language         text not null references public.languages(code),
  status                  public.generation_status not null default 'generating',
  error                   text,
  source_conversation_id  uuid references public.conversations(id) on delete set null,
  level                   public.cefr_level not null,
  title                   text,                                     -- 'Mardi matin'
  content                 jsonb,             -- { sections: [{ pieces: (string | Segment)[], swapPairs? }] }
  section_count           smallint,                                 -- "Abschnitt 2 von 3"
  minutes                 smallint,                                 -- "4 Min"
  model                   text,
  prompt_version          text,
  usage                   jsonb,
  current_section         smallint not null default 1,              -- progress, updated by the app
  completed_at            timestamptz,
  created_at              timestamptz not null default now()
);
create index reading_texts_user_idx on public.reading_texts (user_id, created_at desc);
```

A `Segment` in `content` carries the static part of the word screen (`word`, `trans`, `tag`,
`why`, `from`, `tier`, `flashcardFront?`); "1× wiederholt" is joined at render time from
`flashcards` so an old text shows current numbers. Home card state: "Lesetext erstellen" when no
unfinished text exists, "Weiterlesen · Abschnitt 2 von 3" when one does; likewise "Übung starten"
vs "Übung wiederholen · 5 Aufgaben".

## 5 Flashcards and activity

Flashcards: done — the deck reads `flashcards` (due today, lowest box first, 20 at a time), moves
each card a box on the way out (right: one box up, wrong: back to box 1) and writes the run back
in one `upsert`. What is left here is the per-day cap on new cards.

Activity (moved here from the database plan's deferred list): one row per user and local day; the
streak is derived on the client from the rows, no cached columns, no function.

```sql
alter table public.profiles add column timezone text not null default 'UTC';

create table public.daily_activity (
  user_id          uuid not null references public.profiles(id) on delete cascade,
  day              date not null,                     -- local calendar day, computed by the app
  seconds_learned  int not null default 0,
  conversations    smallint not null default 0,       -- written by end-conversation
  cards_reviewed   smallint not null default 0,
  exercises_done   smallint not null default 0,
  sections_read    smallint not null default 0,
  goal_minutes     smallint not null,                 -- snapshot of profiles.goal_minutes that day
  updated_at       timestamptz not null default now(),
  primary key (user_id, day)
);
```

Streak: `select day … where seconds_learned > 0 order by day desc limit 400`, walk back from
today (or yesterday if today is empty). Week strip: the current week's rows. 08 "Tägliches Limit":
`seconds_learned >= goal_minutes * 60`, countdown to local midnight, a celebration not a lock.

## 6 Row-level security and grants

| Table                            | read | client write                                                             |
| -------------------------------- | ---- | ------------------------------------------------------------------------ |
| `daily_activity`                 | own  | insert / update own                                                      |
| `exercise_attempts`              | own  | insert own                                                               |
| `exercise_sets`, `reading_texts` | own  | update own, **only** `current_step` / `current_section` / `completed_at` |

```sql
revoke update on public.exercise_sets from authenticated;
grant  update (current_step, completed_at) on public.exercise_sets to authenticated;
revoke update on public.reading_texts from authenticated;
grant  update (current_section, completed_at) on public.reading_texts to authenticated;
```

## 7 Edge functions and migrations

| Function             | Input                            | Writes                                           |
| -------------------- | -------------------------------- | ------------------------------------------------ |
| `generate-exercises` | `{ language, set_id? (retry) }`  | `exercise_sets` row; enforces the daily cap      |
| `generate-reading`   | `{ language, text_id? (retry) }` | `reading_texts` row; enforces the daily cap      |
| `end-conversation`   | unchanged                        | + `review.tasks`, `daily_activity.conversations` |

```
…_activity.sql             profiles.timezone, daily_activity (+ RLS)
…_generated_content.sql    generation_status, exercise_sets, exercise_attempts, reading_texts
                           (+ RLS, column grants); app_config.daily_generation_limit
```

Order: activity + streak card → flashcard deck on the real table → `generate-exercises` with the
preparing/error screens → `generate-reading` with the word screen.

---

---

## Moved to Kurs

`grammar_forms` and `grammar_stats` (the grammar overview is a Kurs station; nothing on Lernen or
Sprechen opens it). Until then, generated steps and segments carry a free-text `tag`, and
`exercise_attempts.tag` lets Kurs backfill the stats later.

---

---

## Open questions

1. Keep the typed answer text in `exercise_attempts` (useful for the next generation, but
   user-written content under GDPR) or only correct/incorrect?
2. Daily cap values: 2 texts + 2 exercise sets per day, or should Plus lift the cap?
3. Which text model writes exercises and texts? Separate from the voice model. Also decides the
   DPA note in the Datenschutzerklärung.
4. New flashcards per day and the maximum deck size (the design shows a 64-card run).
