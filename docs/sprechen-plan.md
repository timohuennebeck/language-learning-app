# Yori · Sprechen plan (scenarios)

Companion to `docs/database-plan.md`. Scope: the **Sprechen** tab only: the free conversation
card and the scenario catalogue with its preview screen. The Lernen tab (generated carousel,
streak) is parked in `docs/lernen-plan.md`; Kurs is planned separately.

## 0. What Sprechen is for

Conversations are the metered, paid thing (10 or 30 a month). Sprechen is where the learner spends
them: a free conversation, or a **scenario**, which briefs Pip and the learner on a situation and a
few tasks to complete in the talk. A scenario is a voice conversation with a briefing, nothing
else: no reading text, no exercises of its own. Tapping a tile opens a preview (like the
assessment intro): the situation, the tasks to complete, then "Gespräch starten".

---

## 1 Catalogue: how many, which themes, which levels

**Size.** Launch with **24 scenarios per learning language** (72 rows for fr / en / es) and grow
toward 50–60 in the first year. A learner has at most 30 conversations a month and replays
favourites, so the catalogue must cover every goal at every level rather than be large.

**Themes** reuse the onboarding goals, so the "Für dich" chip is a direct match:

| `theme`   | Chip              | Serves the goal | Example situations                                             |
| --------- | ----------------- | --------------- | -------------------------------------------------------------- |
| `life`    | Alltag            | family, fun     | café, bakery, pharmacy, small talk with a neighbour            |
| `travel`  | Reisen            | travel          | hotel check-in, asking directions, train ticket, lost luggage  |
| `work`    | Arbeit & Studium  | work            | introducing yourself at work, a meeting, a job interview       |
| `social`  | Freunde & Familie | friends, family | making plans, a birthday invitation, the weekend, the in-laws  |
| `culture` | Kultur & Medien   | media           | a series, a concert, a book, football                          |
| `food`    | Essen & Trinken   | everyone        | ordering dinner, a market stall, cooking together, a complaint |

Four situations per theme at launch. The chip labels live in the locale files under
`speak.themes.<theme>`.

**Levels.** One scenario, one **window** (`level_min` / `level_max`), no copy per level: the
situation is the same for an A1 and an A2 learner, and Pip already gets the learner's level in the
prompt. What differs by level is authored inside the row: each task can carry a `level`, and the
preview shows the tasks at or below the learner's level. Suggested
split of the 24: ten A1–A2, eight A2–B1, six B1–B2.

## 2 Table

A scenario is one concept ("cafe") realised once per learning language. The language-neutral
`key` ties the variants together and owns the illustration, theme and level window; per-language
rows carry the title and Pip's prompt; per-app-language strings are jsonb keyed
by locale.

```sql
create type public.scenario_theme as enum ('life', 'travel', 'work', 'social', 'culture', 'food');

create table public.scenarios (
  id            uuid primary key default gen_random_uuid(),
  key           text not null,                          -- 'cafe' · same across languages, names the illustration
  language      text not null references public.languages(code),   -- learning language of this variant
  title         text not null,                          -- 'Au café' · in the learning language
  theme         public.scenario_theme not null,
  level_min     public.cefr_level not null default 'A1',
  level_max     public.cefr_level not null default 'B2',
  minutes       smallint not null default 5,            -- "3–5 Min" on the preview
  illustration_storage_path  text not null,             -- 'scenarios/cafe.webp' in the public `scenarios` bucket
  brief         jsonb not null default '{}',            -- { "de": "Du sitzt in einem Café in Paris. …" } · shown on the preview
  tasks         jsonb not null default '[]',            -- [{ "id": "order", "level": "A1", "text": { "de": "Bestelle einen Kaffee" }, "hint": "un café, s’il vous plaît" }]
  pip_prompt    text not null,                          -- Pip's role and the situation, in the learning language
  sort_order    smallint not null default 0,
  active        boolean not null default true,
  unique (key, language)
);
create index scenarios_feed_idx on public.scenarios (language, active, sort_order);
```

Why jsonb for the localized strings: six locales times a handful of short strings per scenario do
not justify a translations table; the app reads the whole row and picks `brief[app_language]`
with an `en` fallback. The `tasks` shape gets a Zod schema in
`features/speak/data/schemas.ts`, which is also what the content check below runs.

What the learner sees: the tile shows the title in the learning language over "A1–A2 · 5 Min"
(level window and minutes, no subtitle); the illustration and the theme chip carry the meaning.
The preview shows the same header, then the `brief` and the tasks in the app language, so an A1
learner knows what they are about to do before Pip speaks. `brief` and the task `text` are
therefore the only per-locale columns; `title`, `pip_prompt` and the task `hint` are in the
learning language.

Read-only for clients (`select` for `anon, authenticated`), written by the seed.

## 3 Content management: the table is the source of truth

For the MVP the catalogue lives in the database and nowhere else.

- **Editing**: rows are added and changed in Supabase Studio. The jsonb columns (`brief`,
  `tasks`) are edited as JSON there; at 24 scenarios per language that is manageable.
- **Local copy**: `supabase db dump --data-only --schema public -f supabase/seed/scenarios.sql`
  after every catalogue change; `seed.sql` includes that file, so `db reset` has the same rows as
  the hosted project.
- **Illustrations**: uploaded by hand to the public Storage bucket `scenarios`, one file per key
  (`scenarios/cafe.webp`, ~600 px, no text baked in); the row stores the path.
- **Completeness check**: a view instead of a script. It lists every key that lacks a row for a
  language with `learnable = true`, and every row whose `brief` or task `text` lacks
  one of the six app locales. Look at it before a release; later it can run in CI against the
  hosted project.

```sql
create view public.scenario_content_gaps as
with locales as (select code from public.languages where is_app_language),
     keys as (select distinct key from public.scenarios)
select k.key, l.code as language, 'missing variant' as gap
from keys k cross join (select code from public.languages where learnable) l
left join public.scenarios s on s.key = k.key and s.language = l.code
where s.id is null
union all
select s.key, s.language, 'brief lacks ' || loc.code
from public.scenarios s cross join locales loc
where not (s.brief ? loc.code)
union all
select s.key, s.language, 'task ' || (t ->> 'id') || ' lacks ' || loc.code
from public.scenarios s, jsonb_array_elements(s.tasks) t cross join locales loc
where not ((t -> 'text') ? loc.code);
```

A scenario is authored once per key across the three learning languages: the situation, theme,
level window and brief are the same in every row; the title, Pip's prompt and the task
hints are written per learning language. First drafts of the translations can be model-generated
from the German master and reviewed by a native speaker; the view proves presence, not quality.

**Upgrade path** (when a second author or a translator joins): export the rows once into one JSON
file per key under `content/scenarios/`, add a generator that unfolds a file into its three rows
and writes the seed, and run the same completeness rules as a script in CI before anything
reaches a database. The table does not change.

## 4 Conversations: the scenario link

Database-plan changes (pulled forward from the deferred list):

```sql
alter type public.conversation_kind add value 'scenario';
alter table public.conversations add column scenario_id uuid references public.scenarios(id) on delete set null;
```

`start-conversation` takes `scenario_id?`; the function adds `pip_prompt` and the tasks at or
below the learner's level to the system prompt and stores the id. A call from
the "Freies Gespräch" card is `kind = 'free'` with no scenario. `end-conversation`'s review gains
a task checklist, which the Rückblick shows:

```json
"tasks": [{ "id": "order", "done": true, "evidence": "Je voudrais un café, s’il vous plaît." }]
```

`→ Kurs` adds `lesson_id` for its own live station later; the two never overlap.

## 5 Screens

| Screen                          | Reads                                                                                                                                                                             | Writes                                 |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Sprechen tab                    | `scenarios` for the active language (theme chips, level window, "Für dich" from `learner_languages.goal`); credits: RevenueCat customer info + `count(conversations)` this period |                                        |
| Freies Gespräch card            |                                                                                                                                                                                   | `start-conversation` (`kind = 'free'`) |
| Scenario preview (01b restyled) | one `scenarios` row: `brief`, `tasks` filtered by level, `minutes`                                                                                                                | `start-conversation` (`scenario_id`)   |
| Rückblick                       | `conversations.review.tasks`                                                                                                                                                      |                                        |

Load: the catalogue is a few kilobytes (24 rows per language) and changes rarely, so the app
fetches it once per launch per language and keeps it in TanStack Query with a long `staleTime`
(a day) and persisted to AsyncStorage, which also lets the tab render offline. One indexed
select per user per day is nothing for Postgres; the read-only tables never see per-user writes.

Client: `features/speak/` gets `data/schemas.ts` (scenario, task), `data/repository.ts`
(`listScenarios(language)`, `getScenario(key)`), `data/keys.ts`, and the preview screen replaces
the current lesson start screen for scenarios. The `lessons` sample data and the home feed's
`lessons` field go away with it.

## 6 Migration, seed, order

```
supabase/migrations/…_scenarios.sql     scenario_theme, scenarios (+ RLS), scenario_content_gaps view,
                                        conversations.scenario_id, conversation_kind 'scenario'
supabase/seed/scenarios.sql             dumped from the hosted table after each catalogue change;
                                        included by seed.sql
```

1. Schema; the four design scenarios entered in Studio in fr / en / es with their illustrations
   in the `scenarios` bucket; first dump into the seed.
2. Sprechen tab on real rows (cached in the app, see §5); scenario preview;
   `start-conversation` with `scenario_id`.
3. Task checklist in the Rückblick once `end-conversation` exists.
4. The remaining 20 scenarios per language as the content is written; the gaps view stays empty.

---

## Open questions

1. Themes: the six above, or fewer at launch (four themes × six situations)?
2. Preview copy: should the tasks show a hint in the learning language (assumed, from `hint`) or
   stay in the app language only?
3. Illustrations: commission 24 in the Pip style, or generate first drafts?
