# Yori · Lesetext plan

How "Lesetext erstellen" on Lernen becomes real: generating a text, tapping any word in it for a
translation with the sentence aligned, and tinting every word by how well the learner knows it.

Supersedes §4 of `docs/lernen-plan.md` (that section stays as the parked sketch; the differences
are called out in §10). Companion to `docs/database-plan.md`.

The three things the feature has to do:

1. **Create** a text on tap — at the learner's level, about something they care about, reusing the
   words they are currently studying.
2. **Explain** any word on tap — meaning, the sentence it sits in, and the matching phrase in the
   sentence's German translation highlighted.
3. **Show what they know** — every word tinted by its Leitner box, live, so a text read again next
   week looks different because the learner is different.

Point 3 is the one that decides the data model: the tint cannot be baked into the generated text,
because the text is written once and the knowledge changes daily.

---

## 1 The join between a text and the deck

A reading text is French surface forms (`je suis allée`, `un crème`). The deck is flashcards with
a `front` (`aller`, `le crème`). Matching one to the other by string equality fails on the first
conjugated verb, and that is most of the interesting words.

So both sides get a **lemma**: the dictionary form, produced by the generator for every glossed
word and stored on every flashcard.

```sql
-- …_flashcards_lemma.sql
alter table public.flashcards add column lemma text;

-- Nothing writes flashcards yet (the Rückblick "Wörter speichern" is still unwired), so the
-- backfill is a formality rather than a data migration.
update public.flashcards set lemma = lower(btrim(front)) where lemma is null;
alter table public.flashcards alter column lemma set not null;

-- The identity of a card is its lemma, not the surface form it was saved from: 'la cuillère' and
-- 'cuillère' are one card. `front` stays the display form on the card.
alter table public.flashcards drop constraint flashcards_user_id_language_front_key;
alter table public.flashcards add constraint flashcards_user_lemma_key
  unique (user_id, language, lemma);
create index flashcards_lemma_idx on public.flashcards (user_id, language, lemma);

comment on column public.flashcards.lemma is
  'Dictionary form, lowercased and trimmed, no leading article. The join key between a reading text''s glosses and the deck.';
```

Normalisation is one shared client function (`lib/lemma.ts`), used by the generator, by the save
button on the word screen and by the Rückblick: NFC, lowercase, trim, strip a leading article
(`le la les l' un une des`), strip surrounding punctuation. **Diacritics are kept** — `ou` and `où`
are different words.

**Companion change:** `end-conversation`'s `REVIEW_SCHEMA` needs `lemma` alongside `front`/`back`
in `words`. Without it, cards saved from a conversation carry a lemma derived from the surface form
and never match a reading text's glosses — the whole feature silently shows every word as new.

### Box → tier

```ts
// features/reading/lib/tiers.ts
// 0 is the strongest tint (TIER_BG[0]); a word with no card at all is new, which is the point
// of the text, so it gets the strongest tint too.
export const tierOf = (box: number | undefined) =>
  box === undefined || box <= 2 ? 0 : box <= 4 ? 1 : 2;
```

`LEARNED_BOX` is 5, so tier 2 ("you know this") is exactly the learned boxes. The word screen's
"X % sicher" comes out of the same row, no new columns:

```ts
const right = card.reviews - card.lapses;          // saveDeckRun bumps both together
const pct = card.reviews ? Math.round((right / card.reviews) * 100) : null;   // null → "Neu"
```

One query per text render, not per word:

```sql
select lemma, box, reviews, lapses from public.flashcards
where user_id = auth.uid() and language = :lang and lemma = any(:lemmas);
```

---

## 2 Content shape

One immutable jsonb document per text. Tokens reference glosses by id, so a word that appears
three times is written once — which matters, because glosses are where the output tokens go.

```jsonc
{
  "title": "Mardi matin",
  "topic": "café",
  "sections": [
    {
      "index": 1,
      "sentences": [
        {
          "id": "s1",
          "native": "Gestern bin ich in ein kleines Café am Kanal gegangen.",
          "tokens": [
            { "t": "Hier" },
            { "t": ", " },
            { "t": "je suis allée", "g": "g2", "mark": true },
            { "t": " dans un petit " },
            { "t": "café", "g": "g3" }
          ]
        }
      ]
    }
  ],
  "glosses": {
    "g2": {
      "surface": "je suis allée",
      "lemma": "aller",
      "trans": "ich bin gegangen",
      "nativeMarks": ["bin ich", "gegangen"],
      "note": "Passé composé mit être; das -e zeigt, dass eine Frau spricht.",
      "tag": "passé composé",
      "card": { "front": "aller", "back": "gehen", "example": "je suis allée au café" }
    }
  }
}
```

Why this shape:

- **`tokens` is a flat run list**, which is exactly what `InlineFlow` already takes — the reading
  screen's renderer barely changes, only where the pieces come from.
- **`mark: true`** says "this is one of the ~7 chosen highlights of the section". Every token with
  a `g` is tappable; only marked ones get a tint. **No `tier` in the content** — it is derived per
  render from the deck (§1). This is the one real departure from the parked plan and it is forced
  by requirement 3.
- **`native` lives on the sentence, not the gloss.** Today's `content.ts` repeats the whole German
  sentence inside every segment that sits in it; five segments in one sentence means five copies of
  the same string, generated and stored five times.
- **`nativeMarks` are substrings**, not indices — the existing `splitMarks(text, marks)` helper
  already renders exactly that, and a model is far more reliable at quoting a phrase than at
  counting characters. The server validates each one is really a substring (§6).
- **`card`** is the flashcard the save button on the word screen creates, pre-written by the
  generator so saving is one insert and no second model call.

### Tauschwörter mode is free

The "Tauschwörter" section (German boxes that reveal the French on tap, `swapPairs` today) needs
**no generated content at all**: pick N marked glosses in the section and render `gloss.trans`
instead of `token.t`. It is a render mode over the same document. Nothing to generate, nothing to
store, nothing to keep in sync.

---

## 3 The table

```sql
-- …_reading_texts.sql
create type public.generation_status as enum ('generating', 'ready', 'failed');

create table public.reading_texts (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.profiles(id) on delete cascade,
  language                text not null references public.languages(code),
  native_language         text not null references public.languages(code),
  status                  public.generation_status not null default 'generating',
  error_code              text,                       -- 'invalid_content' | 'provider' | 'timeout'
  error                   text,                       -- the detail behind 01d's "Fehler 503"
  source_conversation_id  uuid references public.conversations(id) on delete set null,
  level                   public.cefr_level not null,
  topic                   text,                       -- 'Café in Paris', echoed on the home card
  title                   text,                       -- 'Mardi matin'
  content                 jsonb,
  section_count           smallint,                   -- "Abschnitt 2 von 3" without parsing content
  word_count              smallint,
  minutes                 smallint,                   -- "1 THEMA · 4 MIN"
  writer_model            text,
  annotator_model         text,
  prompt_version          text,
  usage                   jsonb,                      -- both passes' token counts → cost per user
  attempts                smallint not null default 0,
  current_section         smallint not null default 1,
  completed_at            timestamptz,
  ready_at                timestamptz,
  created_at              timestamptz not null default now(),
  constraint reading_texts_section_range
    check (current_section >= 1 and (section_count is null or current_section <= section_count))
);
create index reading_texts_user_idx on public.reading_texts (user_id, created_at desc);
-- "Weiterlesen · Abschnitt 2 von 3": the newest ready text the learner has not finished.
create index reading_texts_open_idx on public.reading_texts (user_id, language, created_at desc)
  where status = 'ready' and completed_at is null;
```

The section constraint matters because `current_section` is the one column the client may write
(§5) — without it a client bug writes "Abschnitt 47 von 3".

### Lookups (optional, recommended)

One row per tapped word. It has no reader on day one except the next generation, which is
precisely its point: the words a learner had to look up but did not save are the best input the
next text can have.

```sql
create table public.reading_lookups (
  id            bigint generated always as identity primary key,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  text_id       uuid not null references public.reading_texts(id) on delete cascade,
  language      text not null references public.languages(code),
  gloss_id      text not null,
  lemma         text not null,
  saved         boolean not null default false,   -- turned into a flashcard from the word screen
  looked_up_at  timestamptz not null default now()
);
create index reading_lookups_user_idx on public.reading_lookups (user_id, language, looked_up_at desc);
```

It also answers "was that text too hard?" (lookups per 100 words) without instrumenting anything
else. Skip it if you would rather not store per-tap behaviour; nothing else depends on it.

---

## 4 Generation

Two passes, because the work is two different jobs (see §8 for which model runs which):

| Pass          | Job                                                                                        | Output size |
| ------------- | ------------------------------------------------------------------------------------------ | ----------- |
| **Writer**    | write the text at the level, reusing the due words; one native translation per sentence    | ~800 tok    |
| **Annotator** | split into tokens, produce every gloss: lemma, meaning, `nativeMarks`, note, flashcard     | ~2,700 tok  |

The writer's job is judgement — register, level, whether the French is idiomatic. The annotator's
job is mechanical and, crucially, **deterministically checkable**: every `surface` must be a
substring of the text the writer wrote, every `nativeMark` a substring of the sentence translation.
A hallucinating annotator is caught by the validator, not by a user.

Inputs the writer reads (the app sends ids only — never the prompt):

- level and goal from `learner_languages`, native language from `profiles.app_language`
- the fronts of up to 20 **due flashcards**, with the instruction to work at least 8 in naturally.
  This is the feature's actual argument: spaced repetition that happens in prose instead of on a card.
- the last finished conversation's `review.words` and `topic` — the text picks up what they just
  talked about
- the titles of the last 5 texts, so it stops writing about cafés
- optionally a topic the user picked on the home card

Level discipline goes in the prompt as a rule with an escape hatch: *stay at CEFR {level}; at most
8 words above it, and every one of those must appear in `glosses`.*

### Job pattern

The app calls `generate-reading`, which inserts the row as `generating`, returns the id
immediately, and finishes the work in `EdgeRuntime.waitUntil()`. The app polls the row behind the
existing "Pip baut deinen Text" screen — TanStack Query with `refetchInterval: 1500`, giving up at
45 s.

**Polling, not Realtime**, contra the parked plan: one websocket, one publication and realtime RLS
config is a lot of machinery for a screen that is on-screen for fifteen seconds and already has to
handle "come back to an unfinished row" anyway. Swap it in later if a second screen wants it.

A row left `generating` because the function instance died is swept the same way
`start-conversation` sweeps stale calls: on each invocation, any of this user's rows still
`generating` and older than 90 s becomes `failed` with `error_code = 'timeout'`. The 01d error
screen's "Nochmal versuchen" re-runs the same row (`{ textId }`), bumping `attempts`.

### Caps

`app_config.daily_generation_limit` = `{ "reading_texts": 2, "exercise_sets": 2 }`. The function
counts today's rows (learner's local day, from `profiles.timezone`) with `status <> 'failed'` and
refuses with `GENERATION_LIMIT`; the app then offers the stored texts.

Failed rows deliberately do not count — otherwise a provider blip costs the learner their day. So
they need their own ceiling, or a retry loop is free compute: **max 10 attempts per user per hour**
across both statuses. Cheap to check, and it is the only abuse surface this feature has.

---

## 5 RLS and grants

| Table              | read | client write                                 |
| ------------------ | ---- | -------------------------------------------- |
| `reading_texts`    | own  | update own, **only** `current_section`, `completed_at` |
| `reading_lookups`  | own  | insert own, update own `saved`               |

```sql
alter table public.reading_texts enable row level security;
create policy "own texts: read"   on public.reading_texts for select using (auth.uid() = user_id);
create policy "own texts: update" on public.reading_texts for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- Rows are written by the function (secret key); no insert policy for clients.
revoke update on public.reading_texts from authenticated;
grant  update (current_section, completed_at) on public.reading_texts to authenticated;
```

---

## 6 Validation before `ready`

Structured outputs guarantee shape, not truth, and a wrong gloss is worse than no text: the learner
memorises the error and then the flashcard keeps teaching it. The function validates and only then
flips `status` to `ready`:

1. every `token.g` resolves to a gloss — dangling refs dropped
2. `gloss.surface` equals the text of the token that points at it — otherwise the word screen
   explains a different word than the one tapped
3. every `nativeMarks` entry is a substring of its sentence's `native` — non-matching marks dropped
4. `sections.length` is 2–3, `word_count` within ±30 % of target, every sentence has a `native`
5. every gloss has a non-empty `lemma` that survives normalisation

Dropping bad marks degrades gracefully (the word screen shows an unhighlighted translation).
Failing 1, 2, 4 or 5 is fatal: `status = 'failed'`, `error_code = 'invalid_content'`, one automatic
retry with the validator's complaint appended to the annotator input. Two failures reach the user
as 01d.

---

## 7 Client changes

| Piece            | Change                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------- |
| Home card        | "Lesetext erstellen" → "Weiterlesen · Abschnitt 2 von 3" when an unfinished ready text exists |
| Route            | `/(app)/reading` takes `?textId`; preparing screen gains real polling instead of its 4 s timer |
| `reading-screen` | `content.sections[n].sentences[].tokens` → `InlineFlow` pieces; tint from `tierOf(box)`   |
| `word-screen`    | reads a gloss id; sentence and `nativeMarks` come from the document; "Speichern" inserts `gloss.card` + `lemma` |
| `data/content.ts`| the hardcoded `segments` / `section1` / `swapSection` become the shape of one fixture used by `dev/` |
| `respondJson`    | takes a `model` argument; it hardcodes `REVIEW_MODEL` today                                |
| Offline          | the document is self-contained → cache it; if the deck query fails, render untinted rather than block |

---

## 8 Which model writes the texts

Reading the pasted columns as **input · cached input · cache write · output**, standard tier, per
million tokens (tell me if that ordering is wrong — the recommendation turns on the ratios between
the models, which hold under any sensible reading):

| Model            | in     | cached | out    | one text, single pass |
| ---------------- | ------ | ------ | ------ | --------------------- |
| `gpt-6-astra`    | $10.00 | $1.00  | $50.00 | **$0.225**            |
| `gpt-5.6-sol`    | $4.00  | $0.40  | $20.00 | **$0.090**            |
| `gpt-5.6-terra`  | $2.00  | $0.20  | $12.00 | **$0.053**            |
| `gpt-5.6-luna`   | $0.20  | $0.02  | $1.20  | **$0.0053**           |

Sizing one generation: ~1.8k stable prompt (schema, rubric, few-shots) + ~700 dynamic (level, 20
due words, last review, recent titles) = **~2.5k in**; a 250-word text, ~10 sentence translations
and ~60 glosses with notes = **~3.2k out**, plus reasoning at low effort, call it **4k**.

**Recommendation: `gpt-5.6-sol` as the writer, `gpt-5.6-luna` as the annotator — about $0.030 a
text.**

- The writer's 800 output tokens are the ones worth paying for: level-accurate, idiomatic French,
  and a correct German rendering of each sentence. This is where a cheap model fails in ways a
  learner cannot detect and will memorise.
- The annotator's 2,700 output tokens are bulk mechanical extraction against a strict schema, and
  §6 checks its work deterministically. Paying writer rates for them is paying for judgement that
  is not being exercised. Putting them on `luna` costs $0.003.
- Net: a **better** writer than single-pass `terra`, at **60 % of the cost**, and each pass can be
  tuned or swapped alone.

**If you want this shipped with one prompt and one call: `gpt-5.6-terra` single-pass, ~$0.053.**
Same order of magnitude, half the code, and the split is a refactor you can do once gloss quality
or the bill says so. That is a defensible way to start.

**`gpt-6-astra`: no.** Four times `terra` for a 250-word constrained text is not where a frontier
model earns its keep. Where it does: **offline**, once — writing the gold few-shot examples and the
CEFR rubric the cheap models then follow, and acting as judge over the eval set below. A few
dollars, spent once, that raises the floor of every cheap generation afterwards.

**`luna` as the writer: no.** It is the right annotator and the wrong author.

Monthly exposure per user, at the 2/day cap (worst case) and at a realistic 12 texts/month:

| Setup              | per text | worst case | realistic |
| ------------------ | -------- | ---------- | --------- |
| sol + luna         | $0.030   | $1.80      | $0.36     |
| terra single-pass  | $0.053   | $3.18      | $0.64     |
| astra single-pass  | $0.225   | $13.50     | $2.70     |

Practical notes:

- **Prompt caching barely helps here.** The cost is output-dominated; caching the 1.8k stable
  prefix saves ~$0.003 a text on `terra`. Worth switching on, not worth designing around — unlike
  the Live path.
- **Model ids in env**, as `OPENAI_REVIEW_MODEL` already is: `OPENAI_READING_WRITER_MODEL`,
  `OPENAI_READING_ANNOTATOR_MODEL`. Switching model becomes a secret change, not a deploy.
- **Pin what ran into the row** (`writer_model`, `annotator_model`, `prompt_version`, `usage`), so
  a bad text is traceable and `select sum(usage)` gives real cost per user per month.
- **Evaluate before committing.** 20 texts per candidate, scored on: level fit, French
  correctness, gloss accuracy in context, alignment correctness, and due-word coverage. `astra` as
  judge for the first three. This is a half-day and it is the only way the choice above stops
  being an argument from price ratios. I cannot verify these four models' capabilities from here —
  the reasoning is the shape of the task plus what they cost.
- Open question 3 in `docs/lernen-plan.md` ("which text model writes exercises and texts?") is
  answered for texts; the exercise generator has the same two-pass shape and should follow.

---

## 9 Order of work

1. `…_flashcards_lemma.sql` — lemma column, unique swap, index; `lib/lemma.ts`; `lemma` into
   `end-conversation`'s review schema
2. `…_reading_texts.sql` — `generation_status`, `reading_texts`, RLS, column grants,
   `app_config.daily_generation_limit`
3. `generate-reading` — two passes, validator, caps, stale sweep; `respondJson` takes a model
4. client: types + repository + query keys, preparing screen polls, reading screen renders the
   document, word screen reads a gloss and saves a card
5. tints: the deck query, `tierOf`, the "X % sicher" derivation
6. `reading_lookups` and the "words you looked up" input to the next generation

Steps 1–4 are a working feature. 5 is what makes it Yori's.

---

## 10 Differences from the parked plan (`lernen-plan.md` §4)

| Parked                                    | Here                                                          | Why                                                   |
| ----------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------- |
| `Segment` carries `tier`                  | tier derived from `flashcards.box` at render                  | the text must age with the learner, not with the row  |
| segments match cards by `front`           | `lemma` on both sides, unique on `(user_id, language, lemma)` | `je suis allée` never equals `aller`                  |
| pieces per section, sentence repeated per segment | sentences own `native`, tokens reference shared glosses | stop generating and storing the same string five times |
| only marked segments are tappable         | every content word has a gloss                                | one call, no per-tap latency, cost, or network        |
| `swapPairs` generated                     | derived from glosses at render                                | it is a render mode, not content                      |
| Realtime on the row                       | polling, 1.5 s                                                | less machinery for a fifteen-second screen            |
| one model                                 | writer + annotator                                            | judgement and bulk extraction have different prices   |

---

## 11 Open questions

1. Does the learner pick the topic (a chip row on the home card) or does Pip always choose? Picking
   is better copy ("1 THEMA") and one more input to the writer.
2. Three sections is the design (`SECTIONS = 3`) and only two are built. Is section 3 the
   Tauschwörter render of section 2, or its own text?
3. Should reading a section count toward `daily_activity.sections_read` and the daily goal minutes,
   and at what rate?
4. Keep `reading_lookups` (§3), or is per-tap behaviour more than you want to store?
5. Does a saved word from a text start in box 1 like every other new card, or in box 2 because it
   was met in context first?
