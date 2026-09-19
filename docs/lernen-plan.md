# Yori · Lernen & Sprechen plan (database + generation)

Companion to `docs/database-plan.md`. Scope: the **Sprechen** tab (scenarios, built first) and the
**Lernen** tab (the generated carousel, the streak, built next). **Kurs** (authored chapters with
five stations, including the grammar station) is planned separately; seams are marked `→ Kurs`.

## 0. What the two tabs are for

Conversations are the metered, paid thing (10 or 30 a month). **Sprechen** is where the learner
spends them: a free conversation, or a scenario that briefs Pip and the learner on a situation and
a few tasks to complete. **Lernen** is the daily loop between conversations: what the learner said
and got wrong becomes a reading text, an exercise set and flashcards ("Deine Gespräche werden
deine Übungen").

Decisions behind this plan:

- **Kurs is authored.** Chapters, texts, tasks and the grammar overview are written once and
  served to everyone. Zero generation. (Planned separately.)
- **Scenarios are voice conversations with a briefing.** A tile on the Sprechen tab opens a
  preview (like the assessment intro): the situation, the tasks to complete in the talk, the
  words to use, then "Gespräch starten". No reading text or exercises of their own.
- **The Lernen carousel generates on tap**, capped per day and stored, so replays are free.
- **Flashcards never call a model.** The deck is the learner's own table.

Build order: **Part A (Sprechen)** needs one table and one column. **Part B (Lernen)** adds the
generated content and activity tables and is not needed for Part A.

---

## Part A · Sprechen tab

### A.1 Catalogue: how many, which themes, which levels

**Size.** Launch with **24 scenarios per learning language** (72 rows for fr / en / es) and grow
toward 50–60 in the first year. A learner has at most 30 conversations a month and replays
favourites, so the catalogue must cover every goal at every level rather than be large.

**Themes** reuse the onboarding goals, so the "Für dich" chip is a direct match:

| `theme`    | Chip              | Serves the goal | Example situations                                             |
| ---------- | ----------------- | --------------- | -------------------------------------------------------------- |
| `everyday` | Alltag            | family, fun     | café, bakery, pharmacy, small talk with a neighbour            |
| `travel`   | Reisen            | travel          | hotel check-in, asking directions, train ticket, lost luggage  |
| `work`     | Arbeit & Studium  | work            | introducing yourself at work, a meeting, a job interview       |
| `social`   | Freunde & Familie | friends, family | making plans, a birthday invitation, the weekend, the in-laws  |
| `culture`  | Kultur & Medien   | media           | a series, a concert, a book, football                          |
| `food`     | Essen & Trinken   | everyone        | ordering dinner, a market stall, cooking together, a complaint |

Four situations per theme at launch. The chip labels live in the locale files under
`speak.themes.<theme>`.

**Levels.** One scenario, one **window** (`level_min` / `level_max`), no copy per level: the
situation is the same for an A1 and an A2 learner, and Pip already gets the learner's level in the
prompt. What differs by level is authored inside the row: each task and each vocabulary entry can
carry a `level`, and the preview shows the entries at or below the learner's level. Suggested
split of the 24: ten A1–A2, eight A2–B1, six B1–B2.

### A.2 Table

A scenario is one concept ("cafe") realised once per learning language. The language-neutral
`key` ties the variants together and owns the illustration, theme and level window; per-language
rows carry the title, Pip's prompt and the vocabulary; per-app-language strings are jsonb keyed
by locale.

```sql
create type public.scenario_theme as enum ('everyday', 'travel', 'work', 'social', 'culture', 'food');

create table public.scenarios (
  id            uuid primary key default gen_random_uuid(),
  key           text not null,                          -- 'cafe' · same across languages, names the illustration
  language      text not null references public.languages(code),   -- learning language of this variant
  title         text not null,                          -- 'Au café' · in the learning language
  theme         public.scenario_theme not null,
  level_min     public.cefr_level not null default 'A1',
  level_max     public.cefr_level not null default 'B2',
  minutes       smallint not null default 5,            -- "3–5 Min" on the preview
  illustration  text not null,                          -- storage path: 'scenarios/cafe.webp'
  subtitle      jsonb not null default '{}',            -- { "de": "Bestellen und bezahlen", "en": "Order and pay" }
  brief         jsonb not null default '{}',            -- { "de": "Du sitzt in einem Café in Paris. …" } · shown on the preview
  tasks         jsonb not null default '[]',            -- [{ "id": "order", "level": "A1", "text": { "de": "Bestelle einen Kaffee" }, "hint": "un café, s’il vous plaît" }]
  vocabulary    jsonb not null default '[]',            -- [{ "term": "l’addition", "level": "A1", "meaning": { "de": "die Rechnung" }, "example": "L’addition, s’il vous plaît." }]
  pip_prompt    text not null,                          -- Pip's role and the situation, in the learning language
  sort_order    smallint not null default 0,
  active        boolean not null default true,
  unique (key, language)
);
create index scenarios_feed_idx on public.scenarios (language, active, sort_order);
```

Why jsonb for the localized strings: six locales times a handful of short strings per scenario do
not justify a translations table; the app reads the whole row and picks `subtitle[app_language]`
with an `en` fallback. The `tasks` / `vocabulary` shapes get a Zod schema in
`features/speak/data/schemas.ts`, which is also what the content check below runs.

Read-only for clients (`select` for `anon, authenticated`), written by the seed.

### A.3 Content pipeline: one source, three languages, six locales

The repo holds the catalogue; the database is only ever filled from it.

```
content/scenarios/
  cafe.json                      one file per key, all learning-language variants inside
  hotel-checkin.json
  …
content/illustrations/
  cafe.webp                      one image per key, ~600 px, no text baked in
scripts/
  check-content.js               fails when a key lacks a learnable language or a jsonb lacks a locale
  gen-seed-scenarios.js          writes supabase/seed/scenarios.sql from content/scenarios
```

`cafe.json`:

```json
{
  "key": "cafe",
  "theme": "everyday",
  "level": ["A1", "B1"],
  "minutes": 5,
  "subtitle": {
    "de": "Bestellen und bezahlen",
    "en": "…",
    "es": "…",
    "fr": "…",
    "it": "…",
    "pt": "…"
  },
  "brief": { "de": "Du sitzt in einem Café in Paris …", "en": "…" },
  "variants": {
    "fr": {
      "title": "Au café",
      "pip_prompt": "Tu es serveur dans un café parisien …",
      "tasks": [
        {
          "id": "order",
          "level": "A1",
          "text": { "de": "Bestelle einen Kaffee", "en": "…" },
          "hint": "un café, s’il vous plaît"
        }
      ],
      "vocabulary": [
        {
          "term": "l’addition",
          "level": "A1",
          "meaning": { "de": "die Rechnung", "en": "the bill" },
          "example": "…"
        }
      ]
    },
    "en": { "title": "At the café", "…": "…" },
    "es": { "title": "En la cafetería", "…": "…" }
  }
}
```

`check-content.js` runs in CI and before `db:reset`: every key has a variant for every language
with `learnable = true` in the seed; every `subtitle`, `brief`, task `text` and vocabulary
`meaning` has all six locales; every `illustration` file exists; task ids are unique per key;
levels lie inside the window. Missing content is a build error, not something noticed in the app.
First drafts of the translations can be model-generated from the German master and reviewed by a
native speaker per language; the check proves presence, not quality.

**Images** go to a public Storage bucket `scenarios` (one file per key, cached by expo-image).
Storage rather than bundled assets because scenarios are added through the database and a new one
must not wait for an app release for its picture. Uploaded by `gen-seed-scenarios.js` via the
service role locally and in CI.

### A.4 Conversations: the scenario link

Database-plan changes (pulled forward from the deferred list):

```sql
alter type public.conversation_kind add value 'scenario';
alter table public.conversations add column scenario_id uuid references public.scenarios(id) on delete set null;
```

`start-conversation` takes `scenario_id?`; the function adds `pip_prompt`, the tasks and the
vocabulary at or below the learner's level to the system prompt and stores the id. A call from
the "Freies Gespräch" card is `kind = 'free'` with no scenario. `end-conversation`'s review gains
a task checklist, which the Rückblick shows:

```json
"tasks": [{ "id": "order", "done": true, "evidence": "Je voudrais un café, s’il vous plaît." }]
```

`→ Kurs` adds `lesson_id` for its own live station later; the two never overlap.

### A.5 Screens

| Screen                          | Reads                                                                                                                                                                             | Writes                                 |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Sprechen tab                    | `scenarios` for the active language (theme chips, level window, "Für dich" from `learner_languages.goal`); credits: RevenueCat customer info + `count(conversations)` this period |                                        |
| Freies Gespräch card            |                                                                                                                                                                                   | `start-conversation` (`kind = 'free'`) |
| Scenario preview (01b restyled) | one `scenarios` row: `brief`, `tasks` and `vocabulary` filtered by level, `minutes`                                                                                               | `start-conversation` (`scenario_id`)   |
| Rückblick                       | `conversations.review.tasks`                                                                                                                                                      |                                        |

Client: `features/speak/` gets `data/schemas.ts` (scenario, task, vocabulary), `data/repository.ts`
(`listScenarios(language)`, `getScenario(key)`), `data/keys.ts`, and the preview screen replaces
the current lesson start screen for scenarios. The `lessons` sample data and the home feed's
`lessons` field go away with it.

### A.6 Migration, seed, order

```
supabase/migrations/…_scenarios.sql     scenario_theme, scenarios (+ RLS), conversations.scenario_id,
                                        conversation_kind 'scenario'
supabase/seed.sql                       includes supabase/seed/scenarios.sql (generated); the four
                                        design scenarios first, the full 24 as content is written
```

1. Schema + the content folder with the four design scenarios in fr / en / es, the check script,
   the seed generator, the Storage bucket.
2. Sprechen tab on real rows; scenario preview; `start-conversation` with `scenario_id`.
3. Task checklist in the Rückblick once `end-conversation` exists.

---

## Part B · Lernen tab (next)

Everything below is needed for the carousel and the streak card, not for Sprechen.

### B.1 When a model is called, and how much

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

### B.2 Job pattern

The app calls the function, which inserts the row with `status = 'generating'`, returns its id at
once, and finishes in the background. The app watches the row (Supabase Realtime on `id`, 20 s
timeout) behind "Pip baut deine Übung". `ready` opens the content; `failed` shows 01d with
"Nochmal versuchen", which re-runs the same row. Content is one jsonb document validated by the
existing Zod schemas on the client. Rows are written by the functions (service role); the user
reads their own rows and may update only the progress columns (column-level grants, B.6).

```sql
create type public.generation_status as enum ('generating', 'ready', 'failed');
```

### B.3 Exercise sets

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

### B.4 Reading texts

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

### B.5 Flashcards and activity

Flashcards: `flashcards` + `flashcard_reviews` already exist; the deck adds the due query
(`due <= now()`, plus N new cards per day), `ts-fsrs` on the device, batched writes, and 42d
computed from the run grouped by `lapses`.

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

### B.6 Row-level security and grants

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

### B.7 Edge functions and migrations

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

## Moved to Kurs

`grammar_forms` and `grammar_stats` (the grammar overview is a Kurs station; nothing on Lernen or
Sprechen opens it). Until then, generated steps and segments carry a free-text `tag`, and
`exercise_attempts.tag` lets Kurs backfill the stats later.

---

## Open questions

**Sprechen**

1. Themes: the six above, or fewer at launch (four themes × six situations)?
2. Preview copy: should the tasks show a hint in the learning language (assumed, from `hint`) or
   stay in the app language only?
3. Illustrations: commission 24 in the Pip style, or generate first drafts?

**Lernen**

4. Keep the typed answer text in `exercise_attempts` (useful for the next generation, but
   user-written content under GDPR) or only correct/incorrect?
5. Daily cap values: 2 texts + 2 exercise sets per day, or should Plus lift the cap?
6. Which text model writes exercises and texts? Separate from the voice model. Also decides the
   DPA note in the Datenschutzerklärung.
7. New flashcards per day and the maximum deck size (the design shows a 64-card run).
