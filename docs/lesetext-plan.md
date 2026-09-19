# Yori · Lesetext plan

How "Lesetext erstellen" on Lernen becomes real: generating a text, tapping any word in it for a
translation with the sentence aligned, and tinting every word by how well the learner knows it.

Supersedes §4 of `docs/lernen-plan.md`. Companion to `docs/database-plan.md`.

The three things the feature has to do:

1. **Create** a text on tap — at the learner's level, about something they care about, reusing the
   words they are currently studying.
2. **Explain** any word on tap — meaning, the sentence it sits in, and the matching phrase in the
   sentence's German translation highlighted.
3. **Show what they know** — every word tinted by its Leitner box, live, so a text read again next
   week looks different because the learner is different.

Point 3 decides the data model: the tint cannot be baked into the generated document, because the
text is written once and the deck changes daily. So the document has to _reference_ words, and
the deck has to reference the same words. That reference is a **lexeme**.

---

## 1 Lexemes: the vocabulary is a table, not a field

A reading text contains surface forms (`je suis allée`, `un crème`). A flashcard contains what the
learner saved (`aller`, `le crème`). Matching by string equality fails on the first conjugated
verb, which is most of the interesting words. And explaining `café` from scratch in every text it
appears in means the same word explained thirty different ways across thirty texts.

Both problems have one answer: a shared vocabulary table, keyed by language and dictionary form,
that texts and flashcards both point at by id.

```sql
-- …_lexemes.sql
create type public.lexeme_pos as enum ('noun', 'verb', 'adj', 'adv', 'phrase', 'other');

-- One row per word (or fixed phrase) of a learning language, in its dictionary form. Shared by
-- every learner of that language; not per user, not per text.
create table public.lexemes (
  id          uuid primary key default gen_random_uuid(),
  language    text not null references public.languages(code),
  lemma       text not null,                        -- 'aller', 'crème', 'tout de suite'
  pos         public.lexeme_pos not null,
  sense       smallint not null default 1,          -- 'allongé' the coffee vs. 'allongé' lying down
  gender      char(1) check (gender in ('m', 'f')), -- nouns; the card front renders 'le/la' from it
  level       public.cefr_level,                    -- rough CEFR level of the word
  tag         text,                                 -- grammar tag, free text ('passé composé') → Kurs
  example     text,                                 -- in the learning language
  created_at  timestamptz not null default now(),
  unique (language, lemma, pos, sense)
);

-- What a lexeme means, per app language. A French word is one lexeme with up to six glosses.
create table public.lexeme_glosses (
  lexeme_id        uuid not null references public.lexemes(id) on delete cascade,
  native_language  text not null references public.languages(code),
  trans            text not null,                   -- 'gehen'
  note             text,                            -- 'Passé composé mit être', in the app language
  verified         boolean not null default false,  -- a human has looked at it
  created_at       timestamptz not null default now(),
  primary key (lexeme_id, native_language)
);

alter table public.lexemes        enable row level security;
alter table public.lexeme_glosses enable row level security;
create policy "lexemes are public" on public.lexemes
  for select to anon, authenticated using (true);
create policy "glosses are public" on public.lexeme_glosses
  for select to anon, authenticated using (true);
-- Written only by the edge functions (secret key).
```

Why two tables: the identity of a word does not depend on who is reading it. `aller` is one
lexeme whether the learner's app language is German or Spanish; only the gloss differs. This is
what lets a flashcard survive an app-language switch (`database-plan.md` §3.6 already wants that)
and lets encounter counts (§5) be per word rather than per word-and-translation.

Why `sense` and not just `lemma`: `allongé` is a coffee or a body position, `le tour` a trip and
`la tour` a tower. `pos` catches the noun/verb and gender collisions; `sense` catches the rest.
Senses are not designed up front — they are created when the annotator says an existing gloss does
not fit the sentence (§4), so the table grows a second sense exactly when a text needs one.

**Lemma normalisation** (server-side only, one function, `_shared/lemma.ts`): Unicode NFC,
lowercase, trim, strip surrounding punctuation, strip one leading article (`le la les l' un une
des`). **Diacritics are kept** — `ou` and `où` are different words. The client never normalises
anything; it only ever sees ids.

### Flashcards point at lexemes

```sql
-- …_flashcards_lexeme.sql
alter table public.flashcards add column lexeme_id uuid references public.lexemes(id) on delete restrict;

-- Backfill: every existing card becomes a lexeme (pos unknown → 'other') and links to it.
-- Real rows are few (the deck only started reading this table this week).
insert into public.lexemes (language, lemma, pos)
select distinct language, lower(btrim(front)), 'other'::public.lexeme_pos from public.flashcards
on conflict do nothing;
insert into public.lexeme_glosses (lexeme_id, native_language, trans)
select l.id, f.back_language, f.back from public.flashcards f
join public.lexemes l on l.language = f.language and l.lemma = lower(btrim(f.front)) and l.pos = 'other'
on conflict do nothing;
update public.flashcards f set lexeme_id = l.id
from public.lexemes l
where l.language = f.language and l.lemma = lower(btrim(f.front)) and l.pos = 'other';

alter table public.flashcards alter column lexeme_id set not null;

-- A card's identity is the word, not the spelling it was saved from.
alter table public.flashcards drop constraint flashcards_user_id_language_front_key;
alter table public.flashcards add constraint flashcards_user_lexeme_key unique (user_id, lexeme_id);
create index flashcards_lexeme_idx on public.flashcards (user_id, lexeme_id);
```

`front` / `back` / `example` stay on the card as they are: copied from the lexeme at save time, so
the card the learner sees never changes under them. `language` stays too — it is denormalised for
the `(user_id, language, due)` index the deck reads.

Nothing in the app creates a flashcard from free text. The two places that create cards both
already have a lexeme id by the time they insert: the word screen (the span carries it, §2) and the
Rückblick (`end-conversation` resolves `review.words[].lexemeId` when it writes the review — the
**one companion change** to an existing function, using the same `resolveLexemes` helper §4
describes).

### Box → tier

```ts
// features/reading/lib/tiers.ts
// 0 is the strongest tint (TIER_BG[0]). No card at all is a new word, which is the point of the
// text, so it gets the strongest tint too.
export const tierOf = (box: number | undefined) =>
  box === undefined || box <= 2 ? 0 : box <= 4 ? 1 : 2;
```

`LEARNED_BOX` is 5, so tier 2 ("you know this") is exactly the learned boxes. "X % sicher" on the
word screen comes out of the same row, no new columns:

```ts
const right = card.reviews - card.lapses; // saveDeckRun bumps both together
const pct = card.reviews ? Math.round((right / card.reviews) * 100) : null; // null → "Neu"
```

---

## 2 The text document

One immutable jsonb document per text. It contains **no vocabulary** — only the prose, its
translation, and spans that point at lexemes by id.

```jsonc
{
  "title": "Mardi matin",
  "sections": [
    {
      "sentences": [
        {
          "id": "s1",
          "source": "Hier, je suis allée dans un petit café près du canal.",
          "native": "Gestern bin ich in ein kleines Café am Kanal gegangen.",
          "spans": [
            {
              "at": 6,
              "len": 13, // "je suis allée"
              "lexeme": "9f1c…", // → lexemes.id (aller · verb · 1)
              "mark": true, // one of the chosen highlights
              "here": "ich bin gegangen", // what this form means in this sentence
              "nativeMarks": ["bin ich", "gegangen"], // the parts of `native` that render it
            },
            { "at": 34, "len": 4, "lexeme": "2b77…", "here": "Café", "nativeMarks": ["Café"] },
          ],
        },
      ],
    },
  ],
}
```

- **`source` is a real string.** The sentence exists as text — for TTS later, for search, for
  export, for reading it in the database. Spans are data _about_ the text, not a partition of it.
- **`at` / `len` are UTF-16 code units**, computed by the server from the phrase the model quoted
  (`indexOf`, nth occurrence for repeats) and consumed by the client's `String.prototype.slice`.
  Both are JavaScript, so they agree; SQL never touches them. `source` is NFC-normalised before
  offsets are computed and stored as-is afterwards; the client must not re-normalise.
- **`nativeMarks` stay as substrings**, deliberately unlike spans. Spans are identity — _which_
  word is tappable — and must be unambiguous when a word appears twice. Marks are highlight hints:
  if one fails to match, the renderer skips it and the translation shows unhighlighted. Substrings
  are what `splitMarks()` already takes.
- **`here`** is the contextual meaning of the inflected form; the lexeme's gloss is the dictionary
  meaning. The word screen shows both — `je suis allée · ich bin gegangen`, then `aller · gehen` —
  which is a better screen than the one the design has.
- **`mark`** says "this is one of the ~7 chosen highlights of the section". Every span is tappable;
  only marked spans get a tint. **The tint itself is not stored** — it is `tierOf(box)` at render.
- Every content word gets a span. Function words (`le`, `de`, `et`, `à`) do not.

### Tauschwörter mode is free

The "Tauschwörter" section (German boxes that reveal the French on tap) needs **no generated
content**: take N marked spans of the section and render `span.here` in place of the source slice.
It is a render mode over the same document.

### What the reading screen loads

Three queries by id array, all cacheable with the text:

```sql
select … from public.reading_texts where id = :id;                                     -- the document
select l.*, g.trans, g.note from public.lexemes l
  join public.lexeme_glosses g on g.lexeme_id = l.id and g.native_language = :native
  where l.id = any(:lexeme_ids);                                                        -- the vocabulary
select lexeme_id, box, reviews, lapses from public.flashcards
  where user_id = (select auth.uid()) and lexeme_id = any(:lexeme_ids);                -- the tints
```

`:lexeme_ids` is a column on the row (§3), so nothing parses jsonb to find out what to load. If the
third query fails (offline, stale deck), render untinted rather than block.

---

## 3 Tables

```sql
-- …_reading_texts.sql
create type public.generation_status as enum ('generating', 'ready', 'failed');

create table public.reading_texts (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.profiles(id) on delete cascade,
  language                text not null references public.languages(code),
  native_language         text not null references public.languages(code),
  status                  public.generation_status not null default 'generating',
  stage                   smallint not null default 0,  -- 0 queued · 1 writing · 2 explaining · 3 done; drives the checklist
  error_code              text,                       -- 'invalid_content' | 'provider' | 'timeout'
  error                   text,                       -- the detail behind 01d's "Fehler 503"
  source_conversation_id  uuid references public.conversations(id) on delete set null,
  level                   public.cefr_level not null,
  topic                   text,                       -- 'Café in Paris', echoed on the home card
  title                   text,
  draft                   jsonb,                      -- writer output, kept until ready so a retry resumes at the annotator
  content                 jsonb,                      -- §2, set with status = 'ready'
  lexeme_ids              uuid[] not null default '{}',
  section_count           smallint,
  word_count              smallint,
  minutes                 smallint,                   -- "1 THEMA · 4 MIN"
  writer_model            text,
  annotator_model         text,
  prompt_version          text,
  usage                   jsonb,                      -- every call's token counts → cost per user
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
-- "Every text where this learner met `prendre`", without a table for it.
create index reading_texts_lexemes_idx on public.reading_texts using gin (lexeme_ids);
-- Two taps on the home card must not start two generations.
create unique index reading_texts_one_generating on public.reading_texts (user_id)
  where status = 'generating';

alter table public.reading_texts enable row level security;
create policy "own texts: read" on public.reading_texts
  for select to authenticated using ((select auth.uid()) = user_id);
-- No client insert or update: rows are written by generate-reading (secret key), progress by the
-- RPC below. This is simpler than the parked plan's column-level grants and cannot be misused.
```

### Progress is an RPC, not a column write

The client never updates `reading_texts`. Finishing a section is one call; the server checks the
section number against the row, so the client cannot write "Abschnitt 47 von 3":

```sql
create or replace function public.mark_section_read(text_id uuid, section int)
returns void language plpgsql security definer set search_path = public as $$
declare
  t public.reading_texts%rowtype;
begin
  select * into t from public.reading_texts
    where id = text_id and user_id = (select auth.uid()) and status = 'ready';
  if not found then raise exception 'text not found' using errcode = 'P0002'; end if;
  if section < 1 or section > t.section_count then raise exception 'bad section'; end if;

  update public.reading_texts
    set current_section = greatest(current_section, least(section + 1, section_count)),
        completed_at = case when section = section_count then coalesce(completed_at, now())
                            else completed_at end
    where id = text_id;
end $$;

revoke all on function public.mark_section_read(uuid, int) from public;
grant execute on function public.mark_section_read(uuid, int) to authenticated;
```

An RPC rather than a column grant because it is the one place per-section side effects will land
later — `daily_activity.sections_read`, and the encounter counts of §11 — without the client ever
gaining write access to the row.

---

## 4 Generation

Three calls, because the work is three different jobs, and a database lookup sits between the
second and third so the third only does what is new:

| Call           | Model | Job                                                                       | ~out tokens  |
| -------------- | ----- | ------------------------------------------------------------------------- | ------------ |
| **Writer**     | sol   | the prose at the level, reusing the due words; one `native` per sentence  | 800          |
| **Lemmatiser** | luna  | per sentence: content words as `{ surface, lemma, pos }`                  | 400          |
| _server_       | —     | offsets; look up `lexemes` by `(language, lemma, pos)` with their glosses |              |
| **Annotator**  | luna  | per span: `here`, `nativeMarks`, and a full gloss **only when needed**    | 600 + 45×new |

The writer's job is judgement — register, level, whether the French is idiomatic. The other two
are mechanical and **deterministically checkable**: every surface must be found in the sentence,
every mark in its translation. A hallucinating annotator is caught by the validator, not by a user.

Output shapes (structured outputs, strict):

```ts
// writer
{ title: string; sections: { sentences: { source: string; native: string }[] }[] }

// lemmatiser
{ sentences: { id: string; words: { surface: string; lemma: string; pos: Pos }[] }[] }

// annotator — input includes, per word, the candidate lexemes already in the table (with trans)
{ spans: {
    sentence: string; surface: string;
    here: string; nativeMarks: string[];
    lexeme: string | null;                       // an offered candidate id that fits this sentence…
    gloss: null | {                              // …or a full gloss, when none was offered or none fits
      trans: string; note: string | null; example: string | null;
      tag: string | null; level: Level; gender: 'm' | 'f' | null;
    };
  }[] }
```

`resolveLexemes` (`_shared/lexemes.ts`, shared with `end-conversation`): for a span with a `gloss`,
insert the lexeme (`sense` = max existing + 1 when a candidate was offered and refused, else 1) and
its gloss for this native language; for a known lexeme missing a gloss in this native language,
the annotator is asked for the gloss only. Returns the id per span.

Inputs the writer reads (the app sends `{ language, topic? }` — never a prompt):

- level and goal from `learner_languages`, native language from `profiles.app_language`
- the lemmas of up to 20 **due flashcards**, with the instruction to work at least 8 in naturally.
  This is the feature's actual argument: spaced repetition that happens in prose instead of on a
  card.
- the last finished conversation's `review.words` and `topic`
- the titles of the last 5 texts, so it stops writing about cafés
- the topic the user picked on the home card, if any

Level discipline is a rule with an escape hatch: _stay at CEFR {level}; at most 8 words above it._

### Job pattern

`generate-reading` inserts the row as `generating`, returns `{ textId }` at once, and finishes in
`EdgeRuntime.waitUntil()`. The app polls the row — TanStack Query, `refetchInterval: 1500`, giving
up at 45 s — behind the same screen "Übung wiederholen" uses. After the writer succeeds, its output
is saved to `draft` and `stage` moves to 2; a retry after an annotator failure resumes there instead
of paying for the prose again.

### The preparing screen

"Text erstellen" opens `/(app)/reading/preparing`, the reading twin of `exercise/preparing`: the
same `ProgressChecklist`, with its own copy under `reading.preparing.*` ("Pip baut deinen Text.").
The exercise version fakes its progress with a 4 s timer; this one has real stages to show, because
`stage` on the row is written between the calls:

| `stage` | checklist                          | ring |
| ------- | ---------------------------------- | ---- |
| 0       | ○ Deine fälligen Wörter ausgewählt | 0.10 |
| 1       | ✓ … · ◌ Text wird geschrieben      | 0.35 |
| 2       | ✓ · ✓ · ◌ Wörter werden erklärt    | 0.75 |
| 3       | ✓ · ✓ · ✓ · ◌ Fertig               | 1.00 |

The ring eases toward the next stage's value while a stage is running, so it never sits still. The
footer counts down from a 20 s estimate. On `ready` the screen `replace`s to `/(app)/reading?textId=`;
on `failed` to `/(app)/reading/error?textId=`.

The error screen is `ExerciseErrorScreen` made reusable: it takes the retry route and reads
`error_code` and `ready_at`/`created_at` from the row for the "Fehler 503 · heute 18:42" pill (both
are hardcoded copy today). Its "Nochmal versuchen" calls the function with `{ textId }` and goes
back to preparing, where the checklist picks up at the stage the row is in — after a failed
annotator that is stage 2, with the first two ticks already done.

"Weiterlesen" skips all of this: an unfinished ready text opens directly.

**Polling, not Realtime** (the parked plan said Realtime): one websocket, one publication and
realtime RLS config is a lot of machinery for a screen that is visible for fifteen seconds and has
to handle "come back to an unfinished row" anyway.

Rows left `generating` by a dead instance are swept the way `start-conversation` sweeps stale
calls: on each invocation, this user's rows still `generating` and older than 90 s become `failed`
with `error_code = 'timeout'`. 01d's "Nochmal versuchen" calls the function with `{ textId }`,
which bumps `attempts` and resumes from `draft` when there is one.

### Caps

`app_config.daily_generation_limit` = `{ "reading_texts": 2, "exercise_sets": 2 }`. The function
counts today's rows with `status <> 'failed'` and refuses with `GENERATION_LIMIT`; the app then
offers the stored texts. "Today" is the UTC day until `profiles.timezone` lands with the activity
migration (`lernen-plan.md` §5); nobody will notice a cap that resets at 01:00 or 02:00.

Failed rows deliberately do not count, so they need their own ceiling or a retry loop is free
compute: **at most 10 attempts per user per hour** across all statuses.

### Validation before `ready`

Structured outputs guarantee shape, not truth, and a wrong gloss is worse than no text: the learner
memorises the error and then the flashcard keeps teaching it.

1. every span's `surface` is found in its sentence — otherwise the span is dropped
2. every span resolved to a lexeme id
3. every `nativeMarks` entry is a substring of the sentence's `native` — non-matching marks dropped
4. `sections.length` is 2–3, `word_count` within ±30 % of the level's target, every sentence has
   a `native`
5. at least 6 of the due lemmas appear among the spans — otherwise the writer is re-run once with
   the shortfall named

Dropping bad marks degrades gracefully. Failing 2 or 4 is fatal for that call: one automatic retry
with the validator's complaint appended to the input; a second failure sets
`status = 'failed'`, `error_code = 'invalid_content'`.

---

## 5 Client changes

| Piece             | Change                                                                                                                                             |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home card         | "Lesetext erstellen" → "Weiterlesen · Abschnitt 2 von 3" when an unfinished ready text exists                                                      |
| Route             | `/(app)/reading?textId=`, plus `reading/preparing` and `reading/error`                                                                             |
| Preparing         | `ProgressChecklist` with `reading.preparing.*` copy, driven by `stage` on the polled row                                                           |
| Error             | `ExerciseErrorScreen` takes a retry route and the row's `error_code`; reading copy under `reading.error.*`                                         |
| `reading-screen`  | `sentences[].source` + `spans` → `InlineFlow` pieces; tint from `tierOf(box)`; "Weiter" calls `mark_section_read`                                  |
| `word-screen`     | `?textId=&sentence=&span=`; shows `here`, then lexeme · gloss, the sentence with marks, the note; "Speichern" inserts a flashcard with `lexeme_id` |
| Rückblick         | "Wörter speichern" inserts cards with `review.words[].lexemeId`                                                                                    |
| `data/content.ts` | the hardcoded segments become one fixture in the new shape, used by `dev/`                                                                         |
| `respondJson`     | takes a `model` argument (it hardcodes `REVIEW_MODEL`) and returns `usage` alongside the object                                                    |
| Offline           | the three queries of §2 are cached together; the deck query failing renders untinted                                                               |

---

## 6 Which model writes the texts

Reading the pasted columns as **input · cached input · cache write · output**, standard tier, per
million tokens (say if that ordering is wrong — the recommendation turns on the ratios between the
models, which hold under any sensible reading):

| Model           | in     | cached | out    |
| --------------- | ------ | ------ | ------ |
| `gpt-6-astra`   | $10.00 | $1.00  | $50.00 |
| `gpt-5.6-sol`   | $4.00  | $0.40  | $20.00 |
| `gpt-5.6-terra` | $2.00  | $0.20  | $12.00 |
| `gpt-5.6-luna`  | $0.20  | $0.02  | $1.20  |

Sizing: the writer sees ~1.8k of stable prompt (rubric, few-shots, schema) + ~700 dynamic (level,
due words, last review, recent titles) and writes ~800 tokens plus low-effort reasoning; the two
luna calls see ~1.5k each and write 400 and 600–3,300 depending on how many words are new.

| Setup                          | cold text | warm text | 2/day cap, month | realistic 12/month |
| ------------------------------ | --------- | --------- | ---------------- | ------------------ |
| **sol writes, luna annotates** | $0.039    | $0.036    | $2.34            | $0.47              |
| terra single pass, no lexicon  | $0.053    | $0.053    | $3.18            | $0.64              |
| terra single pass, lexicon     | $0.053    | $0.025    | $1.50            | $0.30              |
| astra single pass              | $0.225    | $0.225    | $13.50           | $2.70              |

**Recommendation: `sol` writes, `luna` does everything else — three to four cents a text.**
Itemised for a two-minute read (220 words, 12 sentences, ~60 content words): writer 2,500 in,
800 out plus ~400 reasoning = $0.034; lemmatiser $0.0007; annotator $0.0045 cold / $0.0017 warm.
The writer is ~90 % of it and its reasoning tokens are the swing. Tapping a word costs nothing:
the gloss is already on the device and the tap is one Postgres upsert.

- The writer's 800 tokens are the ones worth paying for: level-accurate, idiomatic prose and a
  correct rendering of each sentence. This is where a cheap model fails in ways a learner cannot
  detect and will memorise.
- Everything else is bulk extraction against a strict schema that §4 checks deterministically.
  Paying writer rates for it is paying for judgement that is not being exercised; on luna it costs
  a few tenths of a cent.

**An honest note on the lexicon and cost.** In this split the lexicon barely moves the bill: the
gloss tokens it saves were already on luna, where 2,700 tokens cost $0.003. Its case is not
dollars. It is that every learner sees `café` explained the same way every time, a wrong gloss is
fixed once, flashcards join by key instead of by string, and the encounter counts exist at all.
Where it *does* cut cost in half is single-pass `terra` — which makes that setup competitive again:
one prompt, one call, $0.025 warm, with `terra` rather than `sol` writing the prose. That is the
real trade: **sol+luna for the better writer, terra+lexicon for the simpler pipeline**, at
roughly the same price.

**`astra`: no.** Seven times the cost for a 250-word constrained text. Where it earns its keep is
**offline, once**: writing the gold few-shot examples and the CEFR rubric the cheap models then
follow, and judging the eval set below. A few dollars, spent once.

**`luna` as the writer: no.** The right annotator and the wrong author.

Practical notes:

- Prompt caching barely matters here — the cost is output-dominated. Switch it on, don't design
  around it (unlike the Live path).
- Model ids in env, as `OPENAI_REVIEW_MODEL` already is: `OPENAI_READING_WRITER_MODEL`,
  `OPENAI_READING_HELPER_MODEL`. Switching model is a secret change, not a deploy.
- Pin what ran into the row (`writer_model`, `annotator_model`, `prompt_version`, `usage`) so a
  bad text is traceable and `sum(usage)` is real cost per user per month.
- **Evaluate before committing**: 20 texts per candidate writer, scored on level fit, French
  correctness, gloss accuracy in context, alignment correctness, due-word coverage; `astra` as
  judge. Half a day, and the only way the table above stops being an argument from price ratios —
  I cannot verify these four models' abilities from here.
- `lernen-plan.md` open question 3 ("which text model writes exercises and texts?") is answered
  for texts; the exercise generator has the same writer/annotator shape and should follow.

---

## 7 Migrations and order of work

```
…_lexemes.sql            lexeme_pos, lexemes, lexeme_glosses (+ RLS)
…_flashcards_lexeme.sql  flashcards.lexeme_id, backfill, unique (user_id, lexeme_id)
…_reading_texts.sql      generation_status, reading_texts (+ RLS, indexes), mark_section_read,
                         app_config.daily_generation_limit
```

1. the three migrations; `_shared/lemma.ts`, `_shared/lexemes.ts`; `end-conversation` resolves
   `review.words[].lexemeId`
2. `generate-reading`: writer → lemmatiser → lookup → annotator → validate → `ready`; caps, stale
   sweep, `draft` resume; `respondJson` takes a model and returns usage
3. client: types, repository, query keys; preparing and error screens on the polled row; reading
   screen renders the document; word screen reads a span; `mark_section_read` wired
4. tints: the deck query, `tierOf`, "X % sicher"
5. Rückblick "Wörter speichern" on the real table (it is unwired today and now has a lexeme id to
   insert)

1–3 is a working feature. 4 is what makes it Yori's.

---

## 8 What is settled, what is reversible

| decision                               | reversible?                                                                                                                                                                              |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `flashcards.lexeme_id`, unique on it   | **No** — it changes the identity of rows that will exist. Get it right now.                                                                                                              |
| `lexemes` split from `lexeme_glosses`  | Painful — merging later means denormalising real rows. Get it right now.                                                                                                                 |
| spans (offsets) vs a token array       | Yes — a rewrite of stored jsonb.                                                                                                                                                         |
| jsonb document vs sentence/span tables | Yes, one way: the GIN index on `lexeme_ids` answers the query people usually want a table for; a `reading_sentences` table can be filled from the jsonb in one migration if ever needed. |
| three calls vs one                     | Yes — the row records which models ran.                                                                                                                                                  |
| polling vs Realtime                    | Yes.                                                                                                                                                                                     |

Why not sentence and span tables from the start: a text is ~1 row + 12 sentences + 60 spans; at
the cap that is ~4,400 rows per user per month for data that is always read whole and never
queried into. `database-plan.md` §3.6 made this call for `transcript` and it holds here.

---

## 9 Differences from the parked plan (`lernen-plan.md` §4)

| Parked                                          | Here                                            | Why                                                         |
| ----------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------- |
| `Segment` carries `tier`                        | tier derived from `flashcards.box` at render    | the text must age with the learner, not with the row        |
| segments match cards by `front`                 | both point at `lexemes.id`                      | `je suis allée` never equals `aller`; a key cannot mismatch |
| glosses inside each text                        | shared `lexemes` + `lexeme_glosses`             | one explanation per word, fixable once, joinable            |
| pieces per section, German repeated per segment | `native` once per sentence, spans over `source` | stop storing the same string five times                     |
| only marked segments are tappable               | every content word is a span                    | no per-tap latency, cost or network                         |
| `swapPairs` generated                           | derived from `span.here` at render              | a render mode, not content                                  |
| client updates `current_section`                | `mark_section_read` RPC                         | server checks the section; no client writes to the row      |
| Realtime on the row                             | polling, 1.5 s                                  | less machinery for a fifteen-second screen                  |
| one model                                       | writer + two helper calls                       | judgement and extraction have different prices              |

---

## 10 Open questions

1. Does the learner pick the topic (a chip row on the home card) or does Pip always choose?
   Picking is better copy ("1 THEMA") and one more input to the writer.
2. Three sections is the design (`SECTIONS = 3`) and only two are built. Is section 3 the
   Tauschwörter render of section 2, or its own text?
3. Should reading a section count toward `daily_activity.sections_read` and the daily goal minutes?
   `mark_section_read` is the natural place to write it once that table exists.
4. Does a word saved from a text start in box 1 like every card, or in box 2 because it was met in
   context first?
5. Who verifies glosses? `lexeme_glosses.verified` exists; nothing sets it yet. A dev screen that
   lists unverified glosses by encounter count would be a cheap start.

---

## 11 Later: per-learner word counts

Cut from v1 because nothing reads it yet. When the writer should know which words a learner keeps
looking up but never saves, or when the tint should reflect "read twelve times, never carded" as
well as the box, this is the table:

```sql
-- One row per learner and word they have met. Per user, so it cannot live on the shared `lexemes`
-- row; about un-carded words too, so it cannot live on `flashcards`.
create table public.user_lexemes (
  user_id        uuid not null references public.profiles(id) on delete cascade,
  lexeme_id      uuid not null references public.lexemes(id) on delete cascade,
  encounters     int not null default 0,              -- sections read that contained it
  lookups        int not null default 0,              -- times tapped
  first_seen_at  timestamptz not null default now(),
  last_seen_at   timestamptz not null default now(),
  primary key (user_id, lexeme_id)
);
```

`mark_section_read` gains an upsert of `encounters + 1` for every lexeme in the section (read out
of the document with `jsonb_array_elements`, so the client still writes nothing); the word screen
gains a `record_lookup(lexeme_id)` RPC. One migration, two function bodies, no change to anything
above.
