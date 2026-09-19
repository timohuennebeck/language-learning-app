# Yori · Database plan (Supabase)

Scope of this document: accounts and profiles, language levels, app config, live conversations
(GPT-Live-1) and the flashcards they produce, legal documents (Nutzungsbedingungen /
Datenschutzerklärung), and the local-development workflow. **Lernen** (exercises, flashcard
scheduling, reading, grammar) and **Kurs** (chapters, stations) get their own plans later; where
they touch the tables below, the seam is marked with `→ Lernen` / `→ Kurs`. Everything cut from
earlier drafts is listed in §8 with the moment it comes back.

Launch scope (confirmed):

- **App languages (UI):** German, English, Spanish, French, Italian, Portuguese.
- **Learning languages at launch:** French, English, Spanish. German, Italian and Portuguese show
  under "Bald verfügbar".
- Any learning language can be paired with any app language. Everything the user _reads_ (menus,
  meanings, explanations, Pip's feedback, legal documents) is in the app language; everything they
  _practise_ is in the learning language.

Assumptions (please correct):

- Supabase project in **eu-central-1 (Frankfurt)**: EU users are the core, GDPR applies (consent
  records, in-app account deletion, data minimisation). Users in the Americas only pay ~100 ms
  extra on API calls; the voice stream goes to the model provider directly, so call latency is
  unaffected.
- One learning language at a time, but progress per language is kept ("Dein Fortschritt in
  Französisch bleibt gespeichert").
- Billing at launch is the **monthly subscription only** (10 or 30 conversations per month).
  Packs and referral credits come later (§8).

---

## 1. Local development workflow

Supabase runs locally through Docker (Docker Desktop or OrbStack on macOS).

```
npm i -D supabase                       # CLI pinned per project
npx supabase init                       # creates supabase/config.toml, migrations/, seed.sql
npx supabase start                      # Postgres, Auth, Storage, Studio, Mailpit
```

Local endpoints (defaults from `config.toml`):

| Service                  | URL                    |
| ------------------------ | ---------------------- |
| API (from iOS simulator) | http://127.0.0.1:54321 |
| API (Android emulator)   | http://10.0.2.2:54321  |
| API (physical device)    | http://<LAN-IP>:54321  |
| Studio                   | http://127.0.0.1:54323 |
| Mailpit (auth mails)     | http://127.0.0.1:54324 |

Repo layout to add:

```
supabase/
  config.toml            local ports, auth providers, anonymous sign-ins, redirect urls
  migrations/            ordered SQL files = the single source of truth for the schema
  seed.sql               reference data (languages, app_config, legal documents) + a dev user
  functions/             edge functions (Deno): start-conversation, end-conversation, delete-account
src/shared/lib/
  supabase.ts            client (AsyncStorage session, url polyfill)
  database.types.ts      generated: `supabase gen types typescript --local`
.env.local               EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY (gitignored)
```

Suggested npm scripts:

```json
"db:start": "supabase start",
"db:stop": "supabase stop",
"db:reset": "supabase db reset",
"db:diff": "supabase db diff -f",
"db:types": "supabase gen types typescript --local > src/shared/lib/database.types.ts",
"functions:serve": "supabase functions serve --env-file supabase/.env.local"
```

Rules of the road:

- Schema changes are always a new file in `supabase/migrations/` (`supabase migration new <name>`),
  never edits in Studio. `supabase db reset` replays migrations + seed and must stay green.
- `db:types` runs after every migration; the generated types are committed. Zod schemas in
  `features/*/data/schemas.ts` stay as the domain layer and parse rows into the app's shapes.
- Production: `supabase link --project-ref …` once, then `supabase db push` from CI.
- Secrets for edge functions (`OPENAI_API_KEY`, `REVENUECAT_API_KEY`) live in
  `supabase/.env.local` locally and `supabase secrets set` in production.

`config.toml` settings that matter for this app:

```toml
[auth]
site_url = "yori://"
additional_redirect_urls = ["yori://**", "exp://**"]
enable_anonymous_sign_ins = true          # onboarding before the account exists (see §2)
enable_manual_linking = true              # linkIdentity(): anonymous → Google / Apple
[auth.email]
enable_confirmations = false              # see the open question on email confirmation
[auth.external.apple]  enabled = true     # required on iOS when Google sign-in is offered
[auth.external.google] enabled = true
```

---

## 2. Auth model

Supabase Auth (`auth.users`) is the identity; everything else hangs off `public.profiles`.

Providers: **email + password** (the 12b screen), **Google**, **Apple** (App Store rule 4.8: an
app that offers Google must offer Sign in with Apple). The "Mit Telefonnummer" button in 12 would
need SMS OTP (Twilio etc., paid per message); recommendation is to route that button to the
email screen for v1 or drop it.

**Anonymous sign-in first.** Onboarding collects 9 steps of data and runs the placement call
_before_ the account is created (step 10). Instead of holding all of it in AsyncStorage and
replaying it on sign-up, the app calls `supabase.auth.signInAnonymously()` on first launch. Every
step then writes to the user's own rows straight away, and the placement conversation has a real
`user_id` to rate-limit against. At step 10 the anonymous user is converted into a permanent one
(`updateUser({ email, password })` or `linkIdentity({ provider })`), keeping the same `id` and all
rows. Stale anonymous users (no `onboarding_completed_at` after 30 days) are removed by a scheduled
edge function later.

Caveat for the email path: with confirmations enabled, `updateUser({ email, password })` on an
anonymous user only sends a verification mail and the account stays anonymous until the link is
opened. Either launch with confirmations off (a typo in the address means no recovery) or add a
"Bestätige deine E-Mail" state to onboarding. Open question 7.

**Profile creation happens in the app, not in a trigger.** Right after `signInAnonymously()` the
app runs `profiles.upsert({ id: user.id, app_language, first_name: '' })` and only continues when
that succeeds; the same upsert runs on every cold start, so a profile can never be missing. A
database trigger on `auth.users` would create the row invisibly, and when it fails the user sees a
generic "Database error saving new user" from Auth with nothing the app can act on.

The current `SessionProvider` keeps its API (`session`, `update`, `completeOnboarding`, `reset`),
but becomes a thin layer over the Supabase session + a `profiles` query; the AsyncStorage copy
stays as an offline cache. The route guard changes from `session.onboardingComplete` to
`profile.onboarding_completed_at != null`.

**Where logic lives.** Plain table reads and writes from the app wherever row-level security is
enough (profiles, learner languages, flashcards, consent). Edge functions wherever a secret or a
third party is involved (the model provider, RevenueCat, auth admin). No database functions or
triggers of our own in this plan: every write is a call the app made and whose result it sees.
The one exception is the built-in `moddatetime` trigger that stamps `updated_at`; it cannot fail
in a way the app would need to know about.

---

## 3. Schema

Conventions: `snake_case`, plural table names, `uuid` keys (`gen_random_uuid()`), `timestamptz`,
`updated_at` maintained by the `moddatetime` extension, enums for closed sets, RLS enabled on every
table (policies in §4). `user_id` always references `profiles(id) on delete cascade`, so deleting the
auth user removes everything.

### 3.1 Enums

```sql
create type public.cefr_level          as enum ('A1','A2','B1','B2');
create type public.reminder_repeat     as enum ('daily','weekdays','weekend');
create type public.learning_goal       as enum ('travel','media','family','work','friends','fun');
create type public.level_source        as enum ('self','placement');
create type public.conversation_kind   as enum ('placement','free');   -- 'lesson' added with Kurs
create type public.conversation_status as enum ('active','ended','failed');
create type public.legal_doc_kind      as enum ('terms','privacy');
create type public.platform            as enum ('ios','android','web');
```

### 3.2 Reference data (read-only for clients)

```sql
-- Drives both language pickers. `learnable = false` renders under "Bald verfügbar".
create table public.languages (
  code             text primary key,            -- 'fr', 'de', 'en', …
  name_native      text not null,               -- 'Français'
  is_app_language  boolean not null default false,
  learnable        boolean not null default false,
  sort_order       smallint not null default 0
);

-- Remote configuration, one row per key. Only the secret key (edge functions) writes.
create table public.app_config (
  key          text primary key,
  value        jsonb not null,
  description  text,
  updated_at   timestamptz not null default now()
);
```

`languages` seed:

| code | name_native | is_app_language | learnable |
| ---- | ----------- | --------------- | --------- |
| de   | Deutsch     | true            | false     |
| en   | English     | true            | true      |
| es   | Español     | true            | true      |
| fr   | Français    | true            | true      |
| it   | Italiano    | true            | false     |
| pt   | Português   | true            | false     |

Codes are two-letter ISO 639-1. Regional variants (pt-BR / pt-PT, es-ES / es-419) are not separate
rows; the full device locale is stored on `devices.locale` for number/date formatting only.

`app_config` seed (two keys; if that feels thin, both can be constants in the app and the table
can wait):

| key                        | value     | used by                                       |
| -------------------------- | --------- | --------------------------------------------- |
| `min_app_version`          | `"1.0.0"` | force-update gate                             |
| `conversation_max_seconds` | `360`     | live call timer, `start-conversation` cut-off |
| `placement_max_seconds`    | `120`     | placement call ("Gespräch starten · 2 Min")   |

Plans, prices and the trial are **not** in the database: RevenueCat offerings own them (§3.5).

### 3.3 Profiles and learner state

```sql
create table public.profiles (
  id                       uuid primary key references auth.users(id) on delete cascade,
  first_name               text not null default '' check (char_length(first_name) <= 40),
  app_language             text not null default 'en' references public.languages(code),
  active_language          text references public.languages(code),   -- currently learning
  goal_minutes             smallint not null default 15 check (goal_minutes in (5,10,15,30)),
  reminder_time            time,                                       -- null = reminders off
  reminder_repeat          public.reminder_repeat not null default 'daily',
  onboarding_completed_at  timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- One row per language the user has started. Level, target and goal are per language.
create table public.learner_languages (
  user_id                   uuid not null references public.profiles(id) on delete cascade,
  language                  text not null references public.languages(code),
  level                     public.cefr_level not null default 'A1',
  level_source              public.level_source not null default 'self',
  level_assessed_at         timestamptz,
  placement_conversation_id uuid references public.conversations(id) on delete set null,
  target_level              public.cefr_level not null default 'B1',
  goal                      public.learning_goal,       -- "Warum lernst du Französisch?"
  started_at                timestamptz not null default now(),
  primary key (user_id, language)
);
```

Column notes:

- `reminder_time` + `reminder_repeat` are the two controls on the reminder screens: the time
  wheel and the "Wiederholen" segments (Täglich / Mo–Fr / Wochenende). Both feed the local
  notification schedule; no server involvement.
- No `target_level >= level` constraint: a placement can rate a user above the target they
  picked, and a constraint would fail that write mid-call. `end-conversation` sets
  `target_level = greatest(target_level, level)` instead, and the UI keeps offering only targets
  above the current level.
- `level`, `level_source`, `level_assessed_at` and `placement_conversation_id` replace a separate
  assessments table for now. The 09 "Dein Stand" screen reads the level here and the "3 Stellen"
  evidence from the placement conversation's `review` column (§3.6).
- `app_language` is set from the device locale on the first anonymous sign-in (`detectLanguage()`
  today), falling back to `en` for unsupported locales. The UI should stop a user from learning
  their own app language; that is a client rule, not a constraint.
- Email is not duplicated into `profiles`; the profile and logout screens read it from
  `supabase.auth.getUser()`.

Mapping from the current `Session` schema: `name` → `first_name`, `appLanguage`,
`dailyGoalMinutes` (→ `goal_minutes`), `reminder` → `profiles`; `learningLanguage` → `profiles.active_language`;
`level`, `targetLevel`, `goal` → `learner_languages`; `plusActive` → RevenueCat SDK (§3.5).

### 3.4 Legal documents and consent

The welcome and account screens say "Mit … akzeptierst du die Nutzungsbedingungen und die
Datenschutzerklärung". To prove that later, the documents are versioned in the database and each
acceptance is recorded. Every version exists once per locale; the app fetches
`(kind, locale = profiles.app_language)` and falls back to `en`, and the acceptance row points at
the exact translated document the user saw. The terms screen renders `content_md` instead of the
lorem ipsum in `de.json`; the "Stand 15. September 2026" line comes from `effective_at`.

```sql
create table public.legal_documents (
  id                     uuid primary key default gen_random_uuid(),
  kind                   public.legal_doc_kind not null,
  locale                 text not null default 'en',
  version                text not null,                 -- '2026-09-15'
  content_md             text not null,                 -- rendered as sections in TermsScreen
  effective_at           timestamptz not null,
  requires_reacceptance  boolean not null default false, -- true → app shows a consent sheet
  unique (kind, locale, version)
);

create table public.legal_acceptances (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  document_id  uuid not null references public.legal_documents(id),
  accepted_at  timestamptz not null default now(),
  app_version  text,
  platform     public.platform,
  unique (user_id, document_id)
);
```

Acceptance is written when the anonymous user taps "Los geht's" (welcome) and again when the
account is created, each time with the document version that was on screen. The second write for
the same version hits the unique constraint, so the app uses `upsert(…, { ignoreDuplicates: true })`.

### 3.5 Subscription and the monthly conversation quota

No billing tables at launch. RevenueCat holds the subscription; the database only needs to answer
"how many conversations has this user started in the current period", and `conversations` already
answers that.

- **In the app:** `plusActive`, the plan, the trial, prices, and "In 11 Tagen hast du wieder 30
  Gespräche" all come from the RevenueCat SDK (`getCustomerInfo().entitlements.active.plus`,
  `expirationDate`, offerings). `Purchases.logIn(user.id)` ties the store account to the Supabase
  user. Conversations used this period = `select count(*) from conversations where kind <>
'placement' and status <> 'failed' and started_at >= <period start>` (RLS lets the user read
  only their own rows).
- **In `start-conversation` (server side, cannot be bypassed):** the edge function calls the
  RevenueCat REST API (`GET /v1/subscribers/{user.id}`) with the secret key, reads the active
  `plus` entitlement, its `product_identifier` and `purchase_date` / `expires_date`, maps the
  product to its quota with a constant in the function
  (`{ yori_plus_10_monthly: 10, yori_plus_30_monthly: 30 }`), counts the user's conversations in
  that period the same way, and refuses with `NO_CREDITS` when the quota is reached → the app
  shows 30a "Gespräche aufgebraucht".

The trial is the store intro offer on the same products; a user on trial has the `plus`
entitlement and the plan's normal quota. When packs or referral credits arrive, they need a
balance that outlives the period, and that is when a ledger table comes in (§8).

### 3.6 Live conversations (GPT-Live-1) and flashcards

The app talks to the realtime model directly (WebRTC) using a short-lived token minted by an edge
function; the database sees the lifecycle, the transcript and the review. This keeps the provider
key off the device and puts the quota check server-side.

```sql
create table public.conversations (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.profiles(id) on delete cascade,
  language             text not null references public.languages(code),   -- practised
  native_language      text not null references public.languages(code),   -- app language at call time
  kind                 public.conversation_kind not null,   -- placement | free (→ Kurs adds lesson + lesson_id FK)
  status               public.conversation_status not null default 'active',
  topic                text,                                -- 'Café in Paris' (Rückblick header)
  level                public.cefr_level,                   -- learner level when the call started
  provider             text not null default 'openai',
  model                text,                                -- realtime model id (OPENAI_REALTIME_MODEL)
  provider_session_id  text,
  prompt_version       text,                                -- which system prompt produced this call
  device_id            text,                                -- stable install id, for the placement cap
  max_seconds          int not null default 360,            -- 120 for placement (app_config)
  started_at           timestamptz not null default now(),
  ended_at             timestamptz,
  duration_seconds     int,
  end_reason           text,        -- 'user' | 'max_duration' | 'error' | 'abandoned'
  transcript           jsonb,       -- [{role:'user'|'assistant', text, started_ms, ended_ms}, …]
  review               jsonb,       -- output of end-conversation, see below
  usage                jsonb,       -- provider usage (audio seconds, tokens) → cost per user
  created_at           timestamptz not null default now()
);
create index on public.conversations (user_id, started_at desc);
create index on public.conversations (device_id, started_at desc) where kind = 'placement';

-- The learner's vocabulary, scheduled with FSRS (see "Scheduling" below).
create table public.flashcards (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.profiles(id) on delete cascade,
  language                text not null references public.languages(code),  -- of `front`
  front                   text not null,        -- 'la cuillère'
  back                    text not null,        -- 'der Löffel' / 'the spoon' …
  back_language           text not null references public.languages(code),  -- of `back`
  example                 text,                 -- 'un café à emporter'
  source_conversation_id  uuid references public.conversations(id) on delete set null,
  -- FSRS card state (mirrors the ts-fsrs `Card` type; the app writes it back after each review)
  due                     timestamptz not null default now(),   -- next review; new cards are due now
  stability               real not null default 0,             -- days until recall drops to 90 %
  difficulty              real not null default 0,             -- 1..10
  state                   smallint not null default 0,         -- 0 new · 1 learning · 2 review · 3 relearning
  reps                    int not null default 0,
  lapses                  int not null default 0,              -- times forgotten (the old `misses`)
  scheduled_days          int not null default 0,
  elapsed_days            int not null default 0,
  learning_steps          smallint not null default 0,         -- short-term steps taken today (ts-fsrs ≥ 4)
  last_reviewed_at        timestamptz,
  created_at              timestamptz not null default now(),
  unique (user_id, language, front)
);
create index on public.flashcards (user_id, language, due);   -- "12 Karten fällig"

-- One row per swipe. Needed to optimise the FSRS parameters per user later; never updated.
create table public.flashcard_reviews (
  id              bigint generated always as identity primary key,
  card_id         uuid not null references public.flashcards(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  rating          smallint not null check (rating between 1 and 4),  -- 1 again · 2 hard · 3 good · 4 easy
  state           smallint not null,          -- card state before this review
  stability       real not null,              -- card values after this review
  difficulty      real not null,
  elapsed_days    int not null,
  scheduled_days  int not null,
  reviewed_at     timestamptz not null default now()
);
create index on public.flashcard_reviews (user_id, reviewed_at desc);
create index on public.flashcard_reviews (card_id);
```

**Scheduling.** FSRS (Free Spaced Repetition Scheduler, the algorithm Anki switched to; FSRS-6 is
the current revision) predicts when a card is about to be forgotten from two numbers per card,
_stability_ and _difficulty_, instead of SM-2's fixed multipliers. The database does not know the
algorithm: the `ts-fsrs` npm package runs on the device with the default parameters, and the app
only stores what it hands back.

- **Review**: the swipe deck maps right swipe → `Good` (3) and left swipe → `Again` (1); ts-fsrs
  supports this two-button mode. After each swipe the app updates the card's FSRS columns and
  inserts a `flashcard_reviews` row (batched at the end of the deck, one `upsert` + one `insert`).
- **Due**: `select … from flashcards where user_id = auth.uid() and language = :active and
due <= now() order by due limit 20`. New cards have `state = 0`; a per-day cap on new cards is
  a client constant.
- **Retention target** (default 0.9), the 21 model weights and the new-cards-per-day cap are
  library defaults / client constants; nothing algorithm-related lives in the database.
- **Undo last swipe** is done in memory inside the deck before the batched write; the library's
  `rollback()` would need `due` and `last_elapsed_days` in the log, so it is not used.
- **Later** (→ Lernen): run the FSRS optimiser over `flashcard_reviews` once a user has a few
  hundred reviews and store the 21 fitted parameters in a `fsrs_params jsonb` column on
  `profiles`. Nothing in the schema changes for that.

Trade-off: FSRS needs ~10 columns and a review log where SM-2 needs three columns and no log. The
log is what makes it "intelligent" over time, and it is cheap (one small row per swipe).

`review` shape (written once by `end-conversation`, read by the Rückblick and level-result screens):

```json
{
  "summary": "…",
  "words": [{ "term": "à emporter", "meaning": "zum Mitnehmen", "example": "un café à emporter" }],
  "paraphrases": [
    { "said": "le truc pour remuer", "term": "la cuillère", "meaning": "der Löffel" }
  ],
  "placement": {
    "level": "A2",
    "evidence": [{ "text": "…", "note": "…", "score": 88, "status": "ok" }]
  }
}
```

Why jsonb and not tables: the transcript is written once and read as a whole; the review is a
candidate list the user picks from, not something queried across conversations. Both fit one row.
If Lernen later needs "every sentence the user ever said with _prendre_", a `conversation_turns`
table can be filled from `transcript` in one migration.

Why `flashcards` carries `back_language`: a German user's "der Löffel" and an English user's "the
spoon" are both valid rows, and a user who switches app language keeps the old cards readable.

Call flow:

1. **`start-conversation`** (edge function, JWT required): body `{ language, kind, topic? }`
   (→ Kurs adds `lesson_id`), header `x-device-id` (see "Placement limits" below). For
   `kind = 'placement'` it applies the placement limits and skips the quota; otherwise it runs
   the RevenueCat check from §3.5. It inserts the `conversations` row
   (`native_language = profiles.app_language`, `level` from `learner_languages`, `max_seconds`
   from `placement_max_seconds` or `conversation_max_seconds`), builds the system prompt from level, goal,
   topic, learning language and native language (Pip speaks the learning language, explains and
   accepts mixed answers in the native one), mints the ephemeral realtime token, and returns
   `{ conversation_id, client_secret, max_seconds }`. Any failure is an HTTP error the app shows.
   Before all that it closes the user's stale rows: any conversation still `active` and older than
   `max_seconds` + 5 min becomes `status='ended'`, `end_reason='abandoned'`, `duration_seconds =
max_seconds` (the app crashed or lost the connection; the call is assumed used). Rows the app
   itself reports as failed within 30 s stay free.
2. The app connects, shows the timer and cuts off at `max_seconds`.
3. **`end-conversation`**: body `{ conversation_id, transcript, end_reason }`. Stores the
   transcript, sets `ended_at` / `duration_seconds` / `status`, runs the analysis (words,
   paraphrases, summary, meanings in `native_language`; for `placement` also the level and
   evidence), writes `review`, and for placement updates `learner_languages.level`,
   `level_source`, `level_assessed_at`, `placement_conversation_id`. Returns the `review` so the
   app can show the Rückblick immediately. A call that ended in under 30 s is marked `failed` and
   does not count against the quota.
   **Placement limits.** The placement call is the only conversation that costs nothing, so it is
   the only thing worth abusing. `start-conversation` refuses a `placement` when any of these holds:

4. `learner_languages` already has `placement_conversation_id` set for this user and language:
   one placement per language, ever. Switching languages back and forth never grants another one.
   With three learnable languages an account gets three placements in total.
5. The user is anonymous and already has any `learner_languages` row with a placement: the
   first language's placement is free during onboarding; **a second language requires a
   permanent account** (by then onboarding is done anyway). This closes the reinstall loop, where
   every fresh anonymous user would otherwise get three free calls.
6. `conversations` has 3 or more placements with the same `device_id` in the last 30 days. The
   app sends a stable install id (`expo-application`: iOS vendor id / Android id) as
   `x-device-id`; it is stored on the row. Not tamper-proof, but it makes reinstalling pointless
   for a casual abuser. App Attest / Play Integrity can replace it later if needed.

Placement calls are capped at `placement_max_seconds` (120 s), which also matches the "2 Min"
copy; a placement can never run six minutes. The self-assessment path (06a) costs nothing and has
no limit.

4. The Rückblick screen shows `review.words` and `review.paraphrases`; "N Wörter speichern"
   inserts the picked ones into `flashcards` (`back_language = native_language`). Already-saved
   words ("Gespeichert") are found by `(user_id, language, front)`.

### 3.7 Devices

```sql
create table public.devices (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  expo_push_token  text unique,
  platform         public.platform not null,
  app_version      text,
  locale           text,
  timezone         text,
  push_enabled     boolean not null default false,
  last_seen_at     timestamptz not null default now()
);
```

The daily reminder is a **local scheduled notification** (expo-notifications) in v1: no server,
works offline, respects the repeat option. `devices` exists so a server push ("Eine Lücke von
heute … un café ___") can be added later without a schema change; it is the next candidate to cut
if it feels early.

---

## 4. Row-level security

Every table has RLS enabled. Pattern for user-owned tables:

```sql
alter table public.profiles enable row level security;
create policy "own profile: read"   on public.profiles for select using (auth.uid() = id);
create policy "own profile: insert" on public.profiles for insert with check (auth.uid() = id);
create policy "own profile: update" on public.profiles for update using (auth.uid() = id);
-- no delete policy: auth deletion cascades
```

| Table                                        | read                  | client write                      |
| -------------------------------------------- | --------------------- | --------------------------------- |
| `languages`, `app_config`, `legal_documents` | everyone (incl. anon) | none (secret key only)            |
| `profiles`                                   | own                   | insert / update own               |
| `learner_languages`, `flashcards`, `devices` | own                   | insert / update / delete own      |
| `legal_acceptances`, `flashcard_reviews`     | own                   | insert own                        |
| `conversations`                              | own                   | none (edge functions, secret key) |

Anonymous users (`(auth.jwt() ->> 'is_anonymous')::boolean`) get the same policies; the extra
restrictions (placement only, one language, the device cap) are enforced in `start-conversation`
(§3.6, "Placement limits").

---

## 5. Edge functions

| Function             | Trigger         | Does                                                                                                                       |
| -------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `start-conversation` | app             | placement limit or RevenueCat quota check, insert conversation, mint token                                                 |
| `end-conversation`   | app             | store transcript, run analysis, write review, update level for placement                                                   |
| `delete-account`     | app (09e)       | `auth.admin.deleteUser(uid)` → cascades; RevenueCat is left alone (the copy already tells the user to cancel in the store) |
| `cleanup-anonymous`  | schedule, later | delete anonymous users older than 30 days without completed onboarding                                                     |

Each returns a JSON body or an HTTP error; the app never has to guess whether something happened.
Analytics (PostHog) does not touch the database.

---

## 6. Screen → data map

| Screen                                | Reads                                                                      | Writes                                                                        |
| ------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 02b Welcome                           | `legal_documents` (current versions)                                       | `signInAnonymously`, `profiles` upsert, `legal_acceptances`                   |
| 02c Nutzungsbedingungen / Datenschutz | `legal_documents`                                                          |                                                                               |
| 03 App-Sprache · 09d                  | `languages` (is_app_language)                                              | `profiles.app_language`                                                       |
| 03a Lernsprache · 09c · 01a Sprachen  | `languages` (learnable), `learner_languages`                               | `profiles.active_language`, `learner_languages` row                           |
| 03b Ziel                              |                                                                            | `learner_languages.goal`                                                      |
| 04 Name                               |                                                                            | `profiles.first_name`                                                         |
| 05 / 05a / 09f Erinnerung             |                                                                            | `profiles.reminder_time`, `reminder_repeat`; local notification               |
| 06 → 07 → 08 → 09 Einstufung          | `conversations.review.placement`                                           | `start-conversation` / `end-conversation` (placement)                         |
| 06a Level selbst                      |                                                                            | `learner_languages.level` (source self)                                       |
| 09g Ziel-Level                        |                                                                            | `learner_languages.target_level`                                              |
| 09h / 09g Lernzeit                    |                                                                            | `profiles.goal_minutes`                                                       |
| 11f Paywall · 13 Plus aktiv           | RevenueCat offerings + customer info                                       | purchase via RevenueCat SDK                                                   |
| 12 / 12b Konto                        |                                                                            | `updateUser` / `linkIdentity`, `legal_acceptances`, `onboarding_completed_at` |
| 09b Profil                            | `profiles`, `learner_languages`, `flashcards` count, `conversations` count |                                                                               |
| 09i Einstellungen                     | `profiles`, RevenueCat customer info                                       |                                                                               |
| 09e Konto löschen · 41a Abmelden      |                                                                            | `delete-account` / `signOut`                                                  |
| 02c Live-Konversation                 | RevenueCat customer info, `conversations` count                            | `start-conversation`, `end-conversation`                                      |
| 3h Rückblick                          | `conversations.review`                                                     | `flashcards`                                                                  |
| 30a Gespräche aufgebraucht            | RevenueCat customer info (`expirationDate`)                                | (packs later, §8)                                                             |

Not covered yet, by design: 08b Serie, 08 Tägliches Limit, the streak card and "Heute schon 6 von
15 Min" (→ Lernen, §8), 10a Bewertung (§8), 15 Code teilen / 11b Code einlösen (§8).

---

## 7. Migration order and rollout

```
supabase/migrations/
  20260919092652_extensions_enums.sql   moddatetime, enums
  20260919092707_reference.sql          languages, app_config, legal_documents (+ RLS)
  20260919092726_profiles.sql           profiles, learner_languages (+ RLS)
  20260919092739_consent_devices.sql    legal_acceptances, devices (+ RLS)
  20260919092804_conversations.sql      conversations (incl. device_id), flashcards, flashcard_reviews,
                                        learner_languages.placement_conversation_id (+ RLS)
  20260919094818_goal_minutes_and_legal_title.sql
                                        profiles.goal_minutes (was daily_goal_minutes); legal_documents.title dropped
supabase/seed.sql                       languages (six app languages; fr/en/es learnable),
                                        app_config (three keys), terms + privacy in all six locales
                                        (placeholder text until legal copy exists),
                                        a dev user (dev@yori.app / password) with onboarding done,
                                        six French flashcards
```

Status: **applied to the hosted project** (`language-learning-app`, eu-west-1) on 2026-09-19:
the five migrations are recorded in its migration history under the versions above, the reference
data (languages, config, twelve legal documents) is seeded there, and the `delete-account` edge
function is deployed. The app is wired to it (auth, profiles, learner languages, legal documents,
account flows); `start-conversation` / `end-conversation` wait for the model details (open
question 6). Locally, `npm run db:reset` replays the same files.

Suggested build order in the app:

1. `supabase init`, migrations 0001–0004, client + anonymous auth, profile upsert,
   `SessionProvider` on top of `profiles` / `learner_languages`, account conversion on step
   12/12b, legal documents from the DB. Profile screen reads the real name, level and email.
2. 0005 + `start-conversation` / `end-conversation`: placement call end-to-end, live call,
   Rückblick → `flashcards`, `delete-account`.
3. RevenueCat SDK in the paywall, `Purchases.logIn`, quota check in `start-conversation`.
4. Then **Lernen** (activity + streaks, the flashcard deck on FSRS, exercises, reading), then
   **Kurs**, then the deferred items below as they are needed.

---

## 8. Deferred (cut from this plan on purpose)

| Item                                                                                               | Comes back with                                                                                                                       |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `daily_activity` + streaks                                                                         | **Lernen**: planned in `docs/lernen-plan.md` (derived streak, no cached columns, no function)                                         |
| `level_progress` ("62 % bis B1") and `level_assessments`                                           | **Kurs** (progress is a course metric); re-assessments after N conversations                                                          |
| `products`, `subscriptions`, `revenuecat_events`, `credit_ledger`                                  | **Packs** (non-expiring credits need a balance) or the first time the app needs subscription state offline / in SQL                   |
| `referral_codes`, `referrals`, `redeem_referral_code`, `referral_reward_conversations`             | Referral feature                                                                                                                      |
| `feedback`                                                                                         | Rating screen goes live                                                                                                               |
| `conversation_turns`, `conversation_items`, `saved_words`                                          | Only if cross-conversation queries on the transcript are needed; `transcript` / `review` jsonb and `flashcards` cover today's screens |
| `profiles.timezone`                                                                                | Streaks (day boundaries) or server-side reminders                                                                                     |
| `profiles.fsrs_params`                                                                             | FSRS parameter optimisation per user (needs review history first)                                                                     |
| `conversations.scenario_id` + `kind = 'scenario'` (Lernen), `lesson_id` + `kind = 'lesson'` (Kurs) | `docs/sprechen-plan.md`: scenario tiles are voice conversations with a briefing; Kurs adds its own foreign key later                  |
| Server push via `devices` + a scheduled function                                                   | Reminders with content from the last conversation                                                                                     |

---

## 9. Client changes implied by six app languages and three learning languages

Not database work, but the schema above assumes them:

- `SUPPORTED_APP_LANGUAGES` (`shared/lib/i18n.ts`, today `['de']`) and
  `LearningLanguageSchema` / `UPCOMING_LEARNING_LANGUAGES` (`features/auth/data/schemas.ts`,
  today `['fr']` / `['en','es','de']`) become mirrors of the `languages` table: the pickers render
  from the query, the Zod enums stay as type guards and are checked against the seed in a test.
- Locale files for `es`, `fr`, `it`, `pt` next to `de.json` / `en.json`.
- French-specific copy is parameterised by the learning language: "Warum lernst du Französisch?",
  the goal options ("Reise nach Frankreich", "Freunde in Frankreich"), "B1 in etwa 8 Monaten",
  `common.languagePill` ("Französisch · A2"), the level-self examples (`bonjour`, `merci
beaucoup`, …), the placement questions and the widget sentence. The `learning_goal` enum keeps
  the same six semantic options; only the labels change per language.
- Everything shown _about_ the learning language (level names, blurbs, CTAs) is keyed by
  `app_language`; everything _in_ the learning language (examples, prompts) by `active_language`.
- **Adding a language after onboarding** (09c "Lernsprache", 01a "Neue Sprache"): today the
  screens only flip `learningLanguage` and go back, and the single global `level` would be shown
  for the new language. With per-language rows the app runs a short sub-flow of the three
  language-specific steps, reusing the onboarding components: goal (03b) → level (06 placement
  or 06a self) → target level (09g), then inserts the `learner_languages` row and sets
  `profiles.active_language`. Name, reminder, daily goal, app language and account are per user
  and are not asked again. Switching _back_ to a language that already has a row is a single
  update of `active_language`.

---

## 10. Open questions

1. Fallback app language for devices outside the six locales: `en` (assumed above) or `de`?
2. Phone-number sign-in ("Mit Telefonnummer"): keep (SMS provider + cost) or route to email?
3. Sign in with Apple is required on iOS alongside Google. OK to add it to the account screen?
4. 13 "Plus aktiv" says "15 Minuten Gespräch am Tag", the paywall sells 10/30 conversations per
   month. Which one is the product rule? §3.5 implements the monthly count.
5. Realtime model: the functions default to `gpt-realtime-2.1` (the newest id the OpenAI SDK lists;
   there is no `gpt-live-1` realtime model id, only `gpt-live-transcribe`). Set the secret
   `OPENAI_REALTIME_MODEL` to switch; the id is stored per call in `conversations.model`.
   Pricing per model is on https://developers.openai.com/api/docs/pricing (audio tokens in/out,
   cached input); `conversations.usage` keeps the per-call token counts so the cost per user is
   `sum(usage)` × the price list
   against it; the schema only stores `model` / `provider_session_id` as text.
6. Should transcripts be kept indefinitely, or trimmed after N days once the review is stored
   (data-minimisation argument for the Datenschutzerklärung)?
7. Email confirmation at sign-up: off at launch (simpler, no recovery from typos) or on with a
   confirmation state in onboarding (§2)?
