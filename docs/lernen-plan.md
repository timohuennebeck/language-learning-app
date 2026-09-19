# Yori · Lernen plan (database + generation)

Companion to `docs/database-plan.md`. Scope: everything reachable from the **Lernen** tab: the home
feed, lesson tiles and the lesson start screen, generated exercises ("Pip baut deine Übung"),
generated reading texts with the word screen, the grammar overview, the flashcard deck, and the
activity/streak model that was deferred from the database plan. **Kurs** (chapters with five
stations, "Kapitel aus deinen eigenen Gesprächen") stays separate; the seams are marked `→ Kurs`.

What the screens tell us:

| Screen                                  | Needs                                                                                               |
| --------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 01 Lernen (home)                        | minutes today vs goal, due-card count, four hero cards with live state, filter chips, lesson tiles  |
| 01b Lektion (Au café)                   | one authored lesson: title, level tag, word count, three entry points (live, read, practice)        |
| 01c/01d Übung wird vorbereitet / Fehler | an async generation job with a ready/failed state and a retry                                       |
| 19/25 Aufgaben (4 step kinds)           | an exercise set: ordered steps with answers, distractors, explanations; per-step attempts           |
| 14a/14b/14e Lesen, 16a Worterklärung    | a generated text in sections, tappable segments with explanation, tag, "1× wiederholt", right/total |
| 05 Grammatik                            | grammar forms with right/total per user, the weakest one, an overall score                          |
| 04 Karteikarten, 42d Karten durch       | due cards for the active language, swipe outcomes, cards grouped by miss count                      |
| 08 Tägliches Limit, 08b Serie           | minutes today, reset time, streak days, the Mon–Sun strip                                           |

Two kinds of content sit behind this: **authored** (lessons, grammar forms: written by you, the
same for every user) and **generated** (exercise sets, reading texts, flashcards: written by a model
for one user from their own conversations). The schema keeps them apart.

---

## 1. Authored content

### 1.1 Lessons

The tiles on the home screen and the lesson start screen. One row per scenario and learning
language; the learner-facing title is in the learning language ("Se présenter"), the subtitle
("Kennenlernen · 6 Min") in the app language.

```sql
create type public.lesson_theme as enum ('everyday', 'travel', 'friends', 'work', 'culture');

create table public.lessons (
  id            uuid primary key default gen_random_uuid(),
  language      text not null references public.languages(code),
  slug          text not null,                         -- 'se-presenter' (route param)
  title         text not null,                         -- in the learning language
  theme         public.lesson_theme not null,          -- home filter chips
  level_min     public.cefr_level not null default 'A1',
  level_max     public.cefr_level not null default 'B2',
  minutes       smallint not null default 6,           -- "· 6 Min"
  word_count    smallint not null default 12,          -- "12 Wörter"
  illustration  text,                                  -- asset key; placeholder caption until then
  subtitle      jsonb not null default '{}',           -- { "de": "Kennenlernen", "en": "Getting to know" }
  brief         jsonb not null default '{}',           -- per-locale one-liner for Pip's prompt + the read/practice cards
  vocabulary    jsonb not null default '[]',           -- [{ term, meaning: { de, en, … }, example }] → seeds cards + prompts
  sort_order    smallint not null default 0,
  active        boolean not null default true,
  unique (language, slug)
);
create index lessons_feed_idx on public.lessons (language, active, sort_order);
```

Why jsonb for `subtitle` / `brief` / `vocabulary`: six locales times a handful of short strings
per lesson do not justify a translations table; the app reads the whole row and picks
`subtitle[app_language]` with an `en` fallback. If lessons ever get long localized bodies, split
them into `lesson_translations` then.

Filter chips: "Für dich" = lessons whose theme matches the learner's `goal` (travel → travel,
media → culture, friends → friends, work → work, family → everyday) plus the level window;
"Alltag / Reisen / Freunde" = the theme directly. The chip labels map to `lesson_theme` values in
the locale files.

`→ Kurs` chapters will reference `lessons.id` for their live station; nothing here changes.

The lesson's three entry points:

- **Live sprechen** → `start-conversation` with `lesson_id` (the enum value `lesson` and the
  column `conversations.lesson_id` come back from the deferred list in this plan, not with Kurs).
- **Lesen** → `generate-reading` for this lesson (§2.2).
- **Üben** → `generate-exercises` for this lesson (§2.1).

### 1.2 Grammar forms

The rows of the grammar overview ("Vouvoiement · vous · -ez"). Authored per language, referenced
by exercise steps and reading segments, scored per user.

```sql
create table public.grammar_forms (
  id        uuid primary key default gen_random_uuid(),
  language  text not null references public.languages(code),
  slug      text not null,                       -- 'passe-compose'
  name      text not null,                       -- 'Passé composé' (learning language)
  hint      text not null,                       -- 'avoir + Partizip' style shorthand, learning language
  level     public.cefr_level not null,          -- when it is introduced
  sort_order smallint not null default 0,
  unique (language, slug)
);

-- Per user and form: how often it was used correctly, across exercises and conversations.
create table public.grammar_stats (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  form_id     uuid not null references public.grammar_forms(id) on delete cascade,
  correct     int not null default 0,
  total       int not null default 0,
  updated_at  timestamptz not null default now(),
  primary key (user_id, form_id)
);
```

"Schwächste Form" = the form with the lowest `correct / total` among those with `total >= 3`;
"72 / 100" = `sum(correct) / sum(total)` over the user's forms. "Jetzt üben" calls
`generate-exercises` with `grammar_form_id` so the set drills that form.

---

## 2. Generated content

Both generators follow the same pattern: the app asks an edge function, the function inserts a
row with `status = 'generating'`, returns its id at once, and finishes in the background; the app
watches the row (Supabase Realtime on `id`, with a 20 s timeout) while showing "Pip baut deine
Übung". `ready` opens the content, `failed` shows 01d with "Nochmal versuchen", which calls the
function again for the same row. The four progress lines on 01c are an animation, not real steps.

Content is a jsonb document validated by the existing Zod schemas on the client; the database
does not look inside it. Rows are written by the functions (service role); the user reads their
own rows and may update only the progress columns (column-level grant, see §5).

```sql
create type public.generation_status as enum ('generating', 'ready', 'failed');
```

### 2.1 Exercise sets

```sql
create table public.exercise_sets (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.profiles(id) on delete cascade,
  language                text not null references public.languages(code),
  native_language         text not null references public.languages(code),
  status                  public.generation_status not null default 'generating',
  error                   text,                                   -- "Fehler 503" on 01d
  -- what it was built from (all optional; "Übung wiederholen" on the home card reuses the same inputs)
  source_conversation_id  uuid references public.conversations(id) on delete set null,
  lesson_id               uuid references public.lessons(id) on delete set null,
  grammar_form_id         uuid references public.grammar_forms(id) on delete set null,
  level                   public.cefr_level not null,
  content                 jsonb,             -- { steps: ExerciseStep[] } (features/exercises/data/schemas.ts)
  step_count              smallint,          -- "5 Aufgaben" without parsing content
  model                   text,
  prompt_version          text,
  usage                   jsonb,
  -- progress, updated by the app
  current_step            smallint not null default 0,
  completed_at            timestamptz,
  created_at              timestamptz not null default now()
);
create index exercise_sets_user_idx on public.exercise_sets (user_id, created_at desc);

-- One row per checked answer. Feeds grammar_stats and "Deine Fehler werden zu neuen Aufgaben".
create table public.exercise_attempts (
  id               bigint generated always as identity primary key,
  set_id           uuid not null references public.exercise_sets(id) on delete cascade,
  user_id          uuid not null references public.profiles(id) on delete cascade,
  step_id          text not null,                                   -- ExerciseStep.id inside content
  step_kind        text not null,                                   -- fill-options | fill-free | build | translate-free
  grammar_form_id  uuid references public.grammar_forms(id) on delete set null,
  correct          boolean not null,
  answer           text,                                            -- what the user typed / built
  attempted_at     timestamptz not null default now()
);
create index exercise_attempts_user_idx on public.exercise_attempts (user_id, attempted_at desc);
```

Each `ExerciseStep` in `content` gains an optional `grammarFormId` so an attempt can be attributed;
the app upserts `grammar_stats` (`correct + 1`, `total + 1`) after each check. The mistakes list
for the next generation is `select … from exercise_attempts where user_id = … and correct = false
order by attempted_at desc limit 20`, joined to the step text from `content`; the function reads
it, the app never has to.

### 2.2 Reading texts

```sql
create table public.reading_texts (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.profiles(id) on delete cascade,
  language                text not null references public.languages(code),
  native_language         text not null references public.languages(code),
  status                  public.generation_status not null default 'generating',
  error                   text,
  source_conversation_id  uuid references public.conversations(id) on delete set null,
  lesson_id               uuid references public.lessons(id) on delete set null,
  level                   public.cefr_level not null,
  title                   text,                                     -- 'Mardi matin'
  content                 jsonb,             -- { sections: [{ pieces: (string | Segment)[], swapPairs? }] }
  section_count           smallint,                                 -- "Abschnitt 2 von 3"
  minutes                 smallint,                                 -- "4 Min" on the cards
  model                   text,
  prompt_version          text,
  usage                   jsonb,
  -- progress, updated by the app
  current_section         smallint not null default 1,
  completed_at            timestamptz,
  created_at              timestamptz not null default now()
);
create index reading_texts_user_idx on public.reading_texts (user_id, created_at desc);
```

A `Segment` in `content` carries what the word screen shows statically: `word`, `trans`, `tag`,
`why`, `from` (the conversation it came from), `tier`, `grammarFormId?`, `flashcardFront?`. The
two dynamic lines ("1× wiederholt", "5 von 11 richtig") are not stored in the text: the app joins
them at render time from `flashcards` (`reps`, `lapses` for `flashcardFront`) and `grammar_stats`
(for `grammarFormId`). That way an old text shows current numbers.

Home card copy: "Lesetext erstellen" when there is no unfinished text for the active language,
"Weiterlesen" with the section count when there is (`completed_at is null`).

### 2.3 Flashcards (already in the schema)

`flashcards` + `flashcard_reviews` from the database plan are the deck. Lernen adds behaviour, no
columns:

- **Due deck**: `where user_id = … and language = … and due <= now() order by due limit 20`,
  plus up to N new cards per day (`state = 0`, client constant). "12 Karteikarten fällig" is the
  count of the first part.
- **Card sources**: the Rückblick (`source_conversation_id`), a lesson's `vocabulary`
  (`lesson_id` is not needed on the card; `source_conversation_id` stays null), and a reading
  segment tapped "merken" on the word screen.
- **Swipe** → `ts-fsrs` on the device → update the card's FSRS columns + insert a
  `flashcard_reviews` row, batched at the end of the deck.
- **Karten durch (42d)**: computed from the deck run, grouped by `lapses`; "N Karteikarten
  wiederholen" restarts the deck with the `again` ids. Nothing to store beyond the reviews.

---

## 3. Activity and streaks

Deferred from the database plan; now that Lernen produces the minutes, it goes in. One row per
user and calendar day in the user's time zone; the streak is derived from the rows, no cached
columns and no database function.

```sql
alter table public.profiles add column timezone text not null default 'UTC';  -- from expo-localization on every launch

create table public.daily_activity (
  user_id            uuid not null references public.profiles(id) on delete cascade,
  day                date not null,                     -- local calendar day, computed by the app
  seconds_learned    int not null default 0,
  conversations      smallint not null default 0,
  cards_reviewed     smallint not null default 0,
  exercises_done     smallint not null default 0,       -- checked steps
  sections_read      smallint not null default 0,
  goal_minutes       smallint not null,                 -- snapshot of profiles.goal_minutes that day
  updated_at         timestamptz not null default now(),
  primary key (user_id, day)
);
```

Writes: the app's `logActivity({ seconds, cards, exercises, sections, conversations })` reads
today's row, adds, and upserts it (own row, RLS). Two devices writing the same second is the only
race, and losing a few seconds there is acceptable. Conversations are logged by `end-conversation`
(service role) so a call counts even if the app dies.

Reads:

- **Home / Profil**: today's row → "6 von 10 Min heute"; `goal_minutes` snapshot keeps yesterday's
  bar honest if the goal changed.
- **Streak**: `select day from daily_activity where user_id = … and seconds_learned > 0 order by
day desc limit 400`; the client walks back from today (or yesterday, if today is still empty)
  counting consecutive days. Longest streak is the longest run in the same list. 400 rows is a
  year of daily use; cheap, no cache to keep right.
- **Mon–Sun strip**: the current week's rows; `0` missed, `1` done (`seconds_learned > 0`),
  `2` today pending.
- **08 Tägliches Limit**: shown when today's `seconds_learned >= goal_minutes * 60` after a unit;
  "In 7 Std 12 Min setzt sich dein Limit zurück" = time to local midnight. It is a celebration,
  not a lock: the three cards on it still open their flows.
- **08b Serie gestartet**: after the first unit of a day that extends the streak.

`log_activity()` from the earlier draft is gone: the app knows whether the upsert succeeded.

---

## 4. Generation functions

| Function             | Input                                                                                      | Writes                                                           |
| -------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| `generate-exercises` | `{ language, lesson_id? \| source_conversation_id? \| grammar_form_id?, set_id? (retry) }` | `exercise_sets` row → `content`, `step_count`, `status`, `usage` |
| `generate-reading`   | `{ language, lesson_id? \| source_conversation_id?, text_id? (retry) }`                    | `reading_texts` row likewise                                     |

Both build one prompt from: the learner's level and native language, the lesson `brief` and
`vocabulary` or the conversation `transcript` + `review`, the user's last 20 wrong attempts, the
weakest three `grammar_forms`, and the due `flashcards` fronts (so texts and tasks reuse words the
learner is supposed to see). The model returns JSON matching the Zod schema; the function
validates it before writing `ready`, and writes `failed` + `error` otherwise (the app's 01d).
Model choice is open (question 3): this is text generation, not the realtime voice model.

`end-conversation` (database plan) gains one duty: for each grammar form the review reports as
used, upsert `grammar_stats`.

Cost control: one exercise set or text per source per day per user unless "Übung wiederholen"
explicitly asks for a new one; the function returns the existing `ready` row when it exists.

---

## 5. Row-level security and grants

| Table                             | read     | client write                                                             |
| --------------------------------- | -------- | ------------------------------------------------------------------------ |
| `lessons`, `grammar_forms`        | everyone | none                                                                     |
| `grammar_stats`, `daily_activity` | own      | insert / update own                                                      |
| `exercise_attempts`               | own      | insert own                                                               |
| `exercise_sets`, `reading_texts`  | own      | update own, **only** `current_step` / `current_section` / `completed_at` |

The last line uses column-level grants on top of RLS, so the app can never touch `content` or
`status`:

```sql
revoke update on public.exercise_sets from authenticated;
grant  update (current_step, completed_at) on public.exercise_sets to authenticated;
revoke update on public.reading_texts from authenticated;
grant  update (current_section, completed_at) on public.reading_texts to authenticated;
```

Inserts on both tables stay with the service role (the generation functions).

---

## 6. Screen → data map

| Screen                     | Reads                                                                                                                                                              | Writes                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| 01 Lernen                  | `daily_activity` (today), `profiles.goal_minutes`, due `flashcards` count, latest `reading_texts` / `exercise_sets` for the hero cards, `lessons` by theme + level |                                                                                                     |
| 01b Lektion                | `lessons` row                                                                                                                                                      | `start-conversation` / generators                                                                   |
| 01c Übung wird vorbereitet | `exercise_sets.status` (Realtime)                                                                                                                                  | `generate-exercises`                                                                                |
| 01d Fehler                 | `exercise_sets.error`                                                                                                                                              | `generate-exercises` (retry)                                                                        |
| 19/25 Aufgaben             | `exercise_sets.content`                                                                                                                                            | `exercise_attempts`, `grammar_stats`, `exercise_sets.current_step / completed_at`, `daily_activity` |
| 14 Lesen                   | `reading_texts.content`, `flashcards`, `grammar_stats`                                                                                                             | `reading_texts.current_section / completed_at`, `daily_activity`                                    |
| 16a Worterklärung          | segment from `content`, `flashcards` (reps, lapses), `grammar_stats`                                                                                               | `flashcards` (merken)                                                                               |
| 05 Grammatik               | `grammar_forms` × `grammar_stats`                                                                                                                                  | `generate-exercises` (weakest form)                                                                 |
| 04 Karteikarten            | due `flashcards`                                                                                                                                                   | `flashcards` (FSRS), `flashcard_reviews`, `daily_activity`                                          |
| 42d Karten durch           | deck run (memory), `flashcards.lapses`                                                                                                                             |                                                                                                     |
| 08 / 08b                   | `daily_activity`                                                                                                                                                   |                                                                                                     |
| 09b Profil (streak card)   | `daily_activity`                                                                                                                                                   |                                                                                                     |

---

## 7. Migrations and build order

```
supabase/migrations/
  …_lessons.sql              lesson_theme, lessons, conversations.lesson_id + enum value 'lesson' (+ RLS)
  …_activity.sql             profiles.timezone, daily_activity (+ RLS)
  …_grammar.sql              grammar_forms, grammar_stats (+ RLS)
  …_generated_content.sql    generation_status, exercise_sets, exercise_attempts, reading_texts
                             (+ RLS, column grants)
supabase/seed.sql            four French lessons from the design (Se présenter, Demander son chemin,
                             Au restaurant, À la réception) + the four grammar forms from 05;
                             the dev user gets one ready exercise set and one ready reading text
                             (the design's "Café" content) so every screen renders locally.
```

App order:

1. Activity + streaks: `logActivity`, real numbers on home, profile, 08 and 08b. Small and it
   unblocks every other unit.
2. Flashcard deck on the real table: due query, `ts-fsrs`, batched writes, 42d from the run.
3. Lessons from the database: home tiles, filters, lesson start.
4. `generate-exercises` + the preparing/error screens on Realtime; attempts and grammar stats.
5. `generate-reading` + reading progress + word screen joins.
6. Grammar overview.

---

## 8. Open questions

1. Lessons: authored by you as the seed suggests, or should Pip generate the scenario list too?
   The plan assumes authored, one set per learning language.
2. "Lesetext erstellen" on the home card: from the most recent conversation, the active lesson,
   or the learner's weak words when there is neither? The function accepts all three; the card
   needs a rule.
3. Which model writes exercises and texts? Separate from GPT-Live-1; a text model with JSON
   output is enough. This also decides the DPA note in the Datenschutzerklärung.
4. Daily limit: is 08 purely "goal reached" (assumed) or a real cap on generation to control
   cost? If a cap, `app_config` gets `daily_generation_limit`.
5. New flashcards per day and the maximum deck size (the design shows a 64-card run).
6. Should exercise attempts keep the typed answer text (useful for the next generation, but it
   is user-written content under GDPR) or only correct/incorrect?
