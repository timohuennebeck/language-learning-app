# Yori · Sprechen plan (scenarios)

Companion to `docs/database-plan.md`. Scope: the **Sprechen** tab only: the free conversation
card and the scenario catalogue with its preview screen. The Lernen tab (generated carousel,
streak) is parked in `docs/lernen-plan.md`; Kurs is planned separately.

## 0. What Sprechen is for

Conversations are the metered, paid thing (10 or 30 a month). Sprechen is where the learner spends
them: a free conversation, or a **scenario**, which briefs Pip and the learner on a situation and a
few tasks to complete in the talk. A scenario is a voice conversation with a briefing, nothing
else: no reading text, no exercises of its own. Tapping a tile opens a preview (like the
assessment intro): the situation, the tasks, the words to use, then "Gespräch starten".

---

## 1 Catalogue: how many, which themes, which levels

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

## 2 Table

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

## 3 Content pipeline: one source, three languages, six locales

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

## 4 Conversations: the scenario link

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

## 5 Screens

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

## 6 Migration, seed, order

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

---

## Open questions

1. Themes: the six above, or fewer at launch (four themes × six situations)?
2. Preview copy: should the tasks show a hint in the learning language (assumed, from `hint`) or
   stay in the app language only?
3. Illustrations: commission 24 in the Pip style, or generate first drafts?
