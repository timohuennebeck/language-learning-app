# Yori · Lernen plan (database + generation)

Companion to `docs/database-plan.md`. Scope: everything reachable from the **Lernen** tab. **Kurs**
(authored chapters with five stations) stays separate; the seams are marked `→ Kurs`.

## 0. What Lernen is for

Lernen is the daily practice loop between conversations. Conversations are the metered, paid
thing (10 or 30 a month); Lernen is where the learner spends the days in between, and where what
they said and got wrong turns into practice ("Deine Gespräche werden deine Übungen").

Decisions behind this plan:

- **Kurs is authored.** Chapters, their texts and tasks are written once and served to everyone.
  Zero generation. (Planned separately.)
- **Scenarios are voice conversations with a briefing.** A tile on the home screen opens a
  preview (like the assessment intro): what the situation is, which tasks to complete in the
  talk, then "Gespräch starten". No reading text or exercises of their own.
- **The home carousel generates on tap.** "Lesetext erstellen" and "Übung starten" ask a text
  model for content built from the learner's own conversations, mistakes and due words. A daily
  cap per user bounds the cost; content is stored and replayed for free ("Übung wiederholen").
- **Flashcards and grammar never call a model.** The deck is the learner's own table; grammar
  forms are authored and scored per user.

What each screen needs:

| Screen                                  | Needs                                                                                                |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 01 Lernen (home)                        | minutes today vs goal, due-card count, four hero cards with live state, filter chips, scenario tiles |
| 01b Szenario (Au café)                  | an authored scenario: title, level, vocabulary, the tasks to complete, "Gespräch starten"            |
| 01c/01d Übung wird vorbereitet / Fehler | an async generation job with a ready/failed state and a retry                                        |
| 19/25 Aufgaben (4 step kinds)           | an exercise set: ordered steps with answers, distractors, explanations; per-step attempts            |
| 14a/14b/14e Lesen, 16a Worterklärung    | a generated text in sections, tappable segments with explanation, "1× wiederholt", right/total       |
| 05 Grammatik                            | grammar forms with right/total per user, the weakest one, an overall score                           |
| 04 Karteikarten, 42d Karten durch       | due cards for the active language, swipe outcomes, cards grouped by miss count                       |
| 08 Tägliches Limit, 08b Serie           | minutes today, reset time, streak days, the Mon–Sun strip                                            |

---

## 1. Authored content

### 1.1 Scenarios

The tiles on the home screen ("Se présenter", "Demander son chemin", "Au restaurant", "À la
réception") and their preview screen. One row per situation and learning language.

```sql
create type public.scenario_theme as enum ('everyday', 'travel', 'friends', 'work', 'culture');

create table public.scenarios (
  id            uuid primary key default gen_random_uuid(),
  language      text not null references public.languages(code),
  slug          text not null,                         -- 'au-cafe' (route param)
  title         text not null,                         -- in the learning language
  theme         public.scenario_theme not null,        -- home filter chips
  level_min     public.cefr_level not null default 'A1',
  level_max     public.cefr_level not null default 'B2',
  minutes       smallint not null default 5,           -- "3–5 Min" on the preview
  illustration  text,                                  -- asset key; placeholder caption until then
  subtitle      jsonb not null default '{}',           -- { "de": "Kennenlernen", "en": "Getting to know" }
  brief         jsonb not null default '{}',           -- { "de": "Du bist in einem Café in Paris …" } shown on the preview + given to Pip
  tasks         jsonb not null default '[]',           -- [{ "id": "order", "text": { "de": "Bestelle einen Kaffee" }, "hint": "un café, s’il vous plaît" }]
  vocabulary    jsonb not null default '[]',           -- [{ "term": "l’addition", "meaning": { "de": "die Rechnung" }, "example": "…" }]
  pip_prompt    text not null,                         -- role + situation for the system prompt, learning language
  sort_order    smallint not null default 0,
  active        boolean not null default true,
  unique (language, slug)
);
create index scenarios_feed_idx on public.scenarios (language, active, sort_order);
```

Why jsonb for the localized strings: six locales times a handful of short strings per scenario
do not justify a translations table; the app reads the whole row and picks `subtitle[app_language]`
with an `en` fallback.

Preview screen (01b, restyled after 06 "Einstufung Intro"): title, `brief`, the `tasks` as the
"stages" list, `vocabulary` as chips, CTA "Gespräch starten · 3–5 Min". The CTA calls
`start-conversation` with `scenario_id`; the function adds `pip_prompt`, `tasks` and `vocabulary`
to the system prompt. `end-conversation`'s review marks each task `done` or `missed` (see
`review.tasks` below), which the Rückblick shows as a checklist.

Filter chips: "Für dich" = scenarios whose theme matches the learner's `goal` (travel → travel,
media → culture, friends → friends, work → work, family → everyday) inside the level window;
"Alltag / Reisen / Freunde" = the theme directly.

Database-plan changes this pulls in (they were deferred to Kurs): `conversations.scenario_id`
(nullable FK) and the `conversation_kind` value `scenario`. `→ Kurs` adds `lesson_id` for its own
live station later; the two never overlap.

`review` (database plan §3.6) gains:

```json
"tasks": [{ "id": "order", "done": true, "evidence": "Je voudrais un café, s’il vous plaît." }]
```

### 1.2 Grammar forms

The rows of the grammar overview ("Vouvoiement · vous · -ez"). Authored per language, referenced
by exercise steps and reading segments, scored per user.

```sql
create table public.grammar_forms (
  id          uuid primary key default gen_random_uuid(),
  language    text not null references public.languages(code),
  slug        text not null,                     -- 'passe-compose'
  name        text not null,                     -- 'Passé composé' (learning language)
  hint        text not null,                     -- 'avoir + Partizip' style shorthand
  level       public.cefr_level not null,        -- when it is introduced
  sort_order  smallint not null default 0,
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

"Schwächste Form" = lowest `correct / total` among forms with `total >= 3`; "72 / 100" =
`sum(correct) / sum(total)`. "Jetzt üben" requests an exercise set with `grammar_form_id`.

---

## 2. Generated content

### 2.1 When a model is called, and how much

| Trigger                                                   | Produces                           | Counts against the daily cap |
| --------------------------------------------------------- | ---------------------------------- | ---------------------------- |
| `end-conversation` (every finished call)                  | review (words, paraphrases, tasks) | no                           |
| Home card "Text erstellen"                                | one reading text                   | yes                          |
| Home card "Übung starten", 05 "Jetzt üben"                | one exercise set                   | yes                          |
| "Übung wiederholen", "Weiterlesen", retry of a failed job | nothing (stored content)           | no                           |

`app_config` gains `daily_generation_limit` (default `{ "reading_texts": 2, "exercise_sets": 2 }`).
The generator counts the user's rows created today (local day) with `status <> 'failed'` and
refuses with `GENERATION_LIMIT` when the cap is reached; the app then offers the stored items.
Order of magnitude: a set plus a text is ~13k tokens, a few cents; with the cap, the worst case is
well under a dollar per user per month, and typical use is far lower.

Inputs the generators read (all server-side, the app sends only ids): the learner's level and
native language; the last finished conversation's `transcript` and `review` when one exists (this
is what makes it "aus deinem Gespräch"); the learner's last 20 wrong `exercise_attempts`; the
three weakest `grammar_forms`; the fronts of the due `flashcards`. Without any conversation yet,
the text and the set are built from level, goal, and the due words.

### 2.2 Job pattern

The app calls the function, which inserts the row with `status = 'generating'`, returns its id at
once, and finishes in the background. The app watches the row (Supabase Realtime on `id`, 20 s
timeout) behind "Pip baut deine Übung". `ready` opens the content; `failed` shows 01d with
"Nochmal versuchen", which re-runs the same row (no new row, no cap hit). The four progress lines
on 01c are an animation.

Content is one jsonb document validated by the existing Zod schemas on the client; the database
does not look inside it. Rows are written by the functions (service role); the user reads their
own rows and may update only the progress columns (column-level grants, §5).

```sql
create type public.generation_status as enum ('generating', 'ready', 'failed');
```

### 2.3 Exercise sets

```sql
create table public.exercise_sets (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.profiles(id) on delete cascade,
  language                text not null references public.languages(code),
  native_language         text not null references public.languages(code),
  status                  public.generation_status not null default 'generating',
  error                   text,                                   -- "Fehler 503" on 01d
  source_conversation_id  uuid references public.conversations(id) on delete set null,
  grammar_form_id         uuid references public.grammar_forms(id) on delete set null,  -- 05 "Jetzt üben"
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
  step_id          text not null,                -- ExerciseStep.id inside content
  step_kind        text not null,                -- fill-options | fill-free | build | translate-free
  grammar_form_id  uuid references public.grammar_forms(id) on delete set null,
  correct          boolean not null,
  answer           text,                         -- what the user typed / built (open question 4)
  attempted_at     timestamptz not null default now()
);
create index exercise_attempts_user_idx on public.exercise_attempts (user_id, attempted_at desc);
```

Each `ExerciseStep` in `content` gains an optional `grammarFormId`; after each check the app
inserts the attempt and upserts `grammar_stats`. `→ Kurs` tasks write the same two tables with
`set_id` null and a `kurs_task_id` added then.

### 2.4 Reading texts

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
  -- progress, updated by the app
  current_section         smallint not null default 1,
  completed_at            timestamptz,
  created_at              timestamptz not null default now()
);
create index reading_texts_user_idx on public.reading_texts (user_id, created_at desc);
```

A `Segment` in `content` carries the static part of the word screen: `word`, `trans`, `tag`,
`why`, `from` (the conversation it came from), `tier`, `grammarFormId?`, `flashcardFront?`. The
two dynamic lines ("1× wiederholt", "5 von 11 richtig") are joined at render time from
`flashcards` (`reps`, `lapses`) and `grammar_stats`, so an old text shows current numbers.

Home card state: "Lesetext erstellen" when no unfinished text exists for the active language,
"Weiterlesen · Abschnitt 2 von 3" when one does. Same for the exercise card: "Übung starten"
generates, "Übung wiederholen · 5 Aufgaben" replays the latest set.

### 2.5 Flashcards (already in the schema)

`flashcards` + `flashcard_reviews` from the database plan are the deck; Lernen adds behaviour, no
columns:

- **Due deck**: `where user_id = … and language = … and due <= now() order by due limit 20`, plus
  up to N new cards per day (`state = 0`, client constant). "12 Karteikarten fällig" is the count
  of the first part.
- **Card sources**: the Rückblick (`source_conversation_id`), a scenario's `vocabulary` after the
  call, a reading segment tapped "merken" on the word screen.
- **Swipe** → `ts-fsrs` on the device → FSRS columns + a `flashcard_reviews` row, batched at the
  end of the deck.
- **Karten durch (42d)**: computed from the run, grouped by `lapses`; "N Karteikarten
  wiederholen" restarts the deck with the `again` ids.

---

## 3. Activity and streaks

Deferred from the database plan; now that Lernen produces the minutes, it goes in. One row per
user and calendar day in the user's time zone; the streak is derived from the rows, no cached
columns, no database function.

```sql
alter table public.profiles add column timezone text not null default 'UTC';  -- from expo-localization on every launch

create table public.daily_activity (
  user_id          uuid not null references public.profiles(id) on delete cascade,
  day              date not null,                     -- local calendar day, computed by the app
  seconds_learned  int not null default 0,
  conversations    smallint not null default 0,
  cards_reviewed   smallint not null default 0,
  exercises_done   smallint not null default 0,       -- checked steps
  sections_read    smallint not null default 0,
  goal_minutes     smallint not null,                 -- snapshot of profiles.goal_minutes that day
  updated_at       timestamptz not null default now(),
  primary key (user_id, day)
);
```

Writes: the app's `logActivity({ seconds, cards, exercises, sections })` reads today's row, adds,
and upserts it (own row, RLS). Conversations are logged by `end-conversation` (service role) so a
call counts even if the app dies.

Reads:

- **Home / Profil**: today's row → "6 von 10 Min heute".
- **Streak**: `select day from daily_activity where user_id = … and seconds_learned > 0 order by
day desc limit 400`; the client walks back from today (or yesterday if today is empty) counting
  consecutive days; longest streak is the longest run in the same list.
- **Mon–Sun strip**: the current week's rows.
- **08 Tägliches Limit**: shown when today's `seconds_learned >= goal_minutes * 60` after a unit;
  the countdown is the time to local midnight. A celebration, not a lock.
- **08b Serie gestartet**: after the first unit of a day that extends the streak.

---

## 4. Edge functions

| Function             | Input                                             | Writes                                                                           |
| -------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------- |
| `start-conversation` | + `scenario_id?`                                  | `conversations.scenario_id`; prompt from `pip_prompt`, `tasks`, `vocabulary`     |
| `end-conversation`   | unchanged                                         | + `review.tasks`, `grammar_stats` for forms used, `daily_activity.conversations` |
| `generate-exercises` | `{ language, grammar_form_id?, set_id? (retry) }` | `exercise_sets` row; enforces the daily cap                                      |
| `generate-reading`   | `{ language, text_id? (retry) }`                  | `reading_texts` row; enforces the daily cap                                      |

The generators return JSON matching the Zod schema; the function validates before writing
`ready`, otherwise `failed` + `error`. The text model is a separate choice from the voice model
(open question 3).

---

## 5. Row-level security and grants

| Table                             | read     | client write                                                             |
| --------------------------------- | -------- | ------------------------------------------------------------------------ |
| `scenarios`, `grammar_forms`      | everyone | none                                                                     |
| `grammar_stats`, `daily_activity` | own      | insert / update own                                                      |
| `exercise_attempts`               | own      | insert own                                                               |
| `exercise_sets`, `reading_texts`  | own      | update own, **only** `current_step` / `current_section` / `completed_at` |

The last line uses column-level grants on top of RLS, so the app can never touch `content`,
`status` or the cap-relevant `created_at`:

```sql
revoke update on public.exercise_sets from authenticated;
grant  update (current_step, completed_at) on public.exercise_sets to authenticated;
revoke update on public.reading_texts from authenticated;
grant  update (current_section, completed_at) on public.reading_texts to authenticated;
```

Inserts on both tables stay with the service role (the generators).

---

## 6. Screen → data map

| Screen                     | Reads                                                                                                                                             | Writes                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 01 Lernen                  | `daily_activity` (today), `profiles.goal_minutes`, due `flashcards` count, latest `reading_texts` / `exercise_sets`, `scenarios` by theme + level | `generate-reading` / `generate-exercises` (taps)                         |
| 01b Szenario               | `scenarios` row                                                                                                                                   | `start-conversation` (`scenario_id`)                                     |
| 01c / 01d                  | `exercise_sets.status` / `.error` (Realtime)                                                                                                      | retry                                                                    |
| 19/25 Aufgaben             | `exercise_sets.content`                                                                                                                           | `exercise_attempts`, `grammar_stats`, progress columns, `daily_activity` |
| 14 Lesen                   | `reading_texts.content`, `flashcards`, `grammar_stats`                                                                                            | progress columns, `daily_activity`                                       |
| 16a Worterklärung          | segment from `content`, `flashcards`, `grammar_stats`                                                                                             | `flashcards` (merken)                                                    |
| 05 Grammatik               | `grammar_forms` × `grammar_stats`                                                                                                                 | `generate-exercises` (weakest form)                                      |
| 04 Karteikarten            | due `flashcards`                                                                                                                                  | `flashcards` (FSRS), `flashcard_reviews`, `daily_activity`               |
| 42d Karten durch           | deck run (memory), `flashcards.lapses`                                                                                                            |                                                                          |
| 3h Rückblick               | + `review.tasks` checklist                                                                                                                        |                                                                          |
| 08 / 08b / 09b streak card | `daily_activity`                                                                                                                                  |                                                                          |

---

## 7. Migrations and build order

```
supabase/migrations/
  …_scenarios.sql            scenario_theme, scenarios, conversations.scenario_id + enum value
                             'scenario' (+ RLS)
  …_activity.sql             profiles.timezone, daily_activity (+ RLS)
  …_grammar.sql              grammar_forms, grammar_stats (+ RLS)
  …_generated_content.sql    generation_status, exercise_sets, exercise_attempts, reading_texts
                             (+ RLS, column grants); app_config.daily_generation_limit
supabase/seed.sql            the four French scenarios from the design with tasks + vocabulary,
                             the four grammar forms from 05; the dev user gets one ready exercise
                             set and one ready reading text (the design's "Café" content) so every
                             screen renders locally.
```

App order:

1. Activity + streaks: `logActivity`, real numbers on home, profile, 08 and 08b.
2. Flashcard deck on the real table: due query, `ts-fsrs`, batched writes, 42d from the run.
3. Scenarios from the database: tiles, filters, preview screen (restyle 01b after 06), call with
   `scenario_id`, task checklist in the Rückblick.
4. `generate-exercises` + the preparing/error screens on Realtime; attempts and grammar stats;
   daily cap.
5. `generate-reading` + reading progress + word screen joins.
6. Grammar overview.

---

## 8. Open questions

1. Daily cap values: 2 texts + 2 exercise sets per day, or should Plus lift the cap?
2. "Lesetext erstellen" before any conversation: generate from level, goal and due words (assumed),
   or send the learner to a scenario first?
3. Which text model writes exercises and texts? Separate from the voice model; JSON output is
   enough. Also decides the DPA note in the Datenschutzerklärung.
4. Keep the typed answer text in `exercise_attempts` (useful for the next generation, but
   user-written content under GDPR) or only correct/incorrect?
5. New flashcards per day and the maximum deck size (the design shows a 64-card run).
6. Scenario tasks: fixed list per scenario (assumed), or a subset picked by level?
