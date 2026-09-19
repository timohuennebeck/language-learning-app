# Yori · Database plan (Supabase)

Scope of this document: user accounts and profiles, language levels, app config, streaks,
live conversations (GPT-Live-1), legal documents (Nutzungsbedingungen / Datenschutzerklärung),
billing and referral credits, and the local-development workflow. **Lernen** (exercises,
flashcards, reading, grammar) and **Kurs** (chapters, stations) are out of scope and get their own
plan later; where they touch the tables below, the seam is marked with `→ Lernen` / `→ Kurs`.

Assumptions (please correct):

- Launch in the DACH / EU market → Supabase project in **eu-central-1 (Frankfurt)**, prices in EUR,
  GDPR applies (consent records, in-app account deletion, data minimisation).
- One learning language at a time, but progress per language is kept ("Dein Fortschritt in
  Französisch bleibt gespeichert").
- The unit of billing is **one conversation** ("Gespräch", up to 6 minutes). Referral rewards
  ("1 Stunde") are converted into conversations (see open questions).

---

## 1. Local development workflow

Supabase runs locally through Docker (Docker Desktop or OrbStack on macOS).

```
npm i -D supabase                       # CLI pinned per project
npx supabase init                       # creates supabase/config.toml, migrations/, seed.sql
npx supabase start                      # Postgres, Auth, Storage, Studio, Mailpit
```

Local endpoints (defaults from `config.toml`):

| Service                  | URL                                                 |
| ------------------------ | --------------------------------------------------- |
| API (from iOS simulator) | http://127.0.0.1:54321                              |
| API (Android emulator)   | http://10.0.2.2:54321                               |
| API (physical device)    | http://<LAN-IP>:54321                               |
| Studio                   | http://127.0.0.1:54323                              |
| Mailpit (auth mails)     | http://127.0.0.1:54324                              |

Repo layout to add:

```
supabase/
  config.toml            local ports, auth providers, anonymous sign-ins, redirect urls
  migrations/            ordered SQL files = the single source of truth for the schema
  seed.sql               reference data (languages, app_config, legal documents) + a dev user
  functions/             edge functions (Deno): start-conversation, end-conversation,
                         revenuecat-webhook, delete-account
src/shared/lib/
  supabase.ts            client (AsyncStorage session, url polyfill)
  database.types.ts      generated: `supabase gen types typescript --local`
.env.local               EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY (gitignored)
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
- Production: `supabase link --project-ref …` once, then `supabase db push` from CI. Consider
  Supabase branching later for preview environments; not needed at the start.
- Secrets for edge functions (`OPENAI_API_KEY`, `REVENUECAT_WEBHOOK_SECRET`) live in
  `supabase/.env.local` locally and `supabase secrets set` in production.

`config.toml` settings that matter for this app:

```toml
[auth]
site_url = "yori://"
additional_redirect_urls = ["yori://**", "exp://**"]
enable_anonymous_sign_ins = true          # onboarding before the account exists (see §3)
[auth.email]
enable_confirmations = false              # turn on before launch
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
*before* the account is created (step 10). Instead of holding all of it in AsyncStorage and
replaying it on sign-up, the app calls `supabase.auth.signInAnonymously()` on first launch. Every
step then writes to the user's own rows straight away, and the placement conversation has a real
`user_id` to bill and rate-limit against. At step 10 the anonymous user is converted into a
permanent one (`updateUser({ email, password })` or `linkIdentity({ provider })`), keeping the same
`id` and all rows. Stale anonymous users (no `onboarding_completed_at` after 30 days) are deleted by
a scheduled job.

The current `SessionProvider` keeps its API (`session`, `update`, `completeOnboarding`, `reset`),
but becomes a thin layer over the Supabase session + a `profiles` query; the AsyncStorage copy
stays as an offline cache. The route guard changes from `session.onboardingComplete` to
`profile.onboarding_completed_at != null`.

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
create type public.level_source        as enum ('self','placement_call','reassessment');
create type public.conversation_kind   as enum ('placement','lesson','free');
create type public.conversation_status as enum ('pending','active','ended','failed');
create type public.credit_bucket       as enum ('monthly','purchased');
create type public.credit_reason       as enum ('trial_grant','monthly_grant','pack_purchase',
                                                'referral_reward','conversation','refund','admin');
create type public.subscription_status as enum ('trial','active','billing_issue','cancelled','expired');
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

-- Remote configuration, one row per key. Only the service role writes.
create table public.app_config (
  key          text primary key,
  value        jsonb not null,
  description  text,
  updated_at   timestamptz not null default now()
);
```

Initial `app_config` keys (seed):

| key                                  | value                              | used by                     |
| ------------------------------------ | ---------------------------------- | --------------------------- |
| `min_app_version`                    | `"1.0.0"`                          | force-update gate           |
| `conversation_max_seconds`           | `360`                              | live call timer / cut-off   |
| `plans`                              | `[{id:"plus_10",talks:10},{id:"plus_30",talks:30}]` | paywall (prices from RevenueCat) |
| `trial_days`                         | `5`                                | paywall copy                |
| `trial_conversations`                | `5`                                | grant on trial start        |
| `packs`                              | `[{id:"pack_10",talks:10},{id:"pack_25",talks:25},{id:"pack_50",talks:50}]` | talk-limit screen |
| `referral_reward_conversations`      | `10`                               | redeem code (≈ 1 Stunde)    |
| `reassessment_every_n_conversations` | `10`                               | "8 Gespräche übrig bis zur nächsten Einstufung" |
| `daily_goal_options_minutes`         | `[5,10,15,30]`                     | goal pickers                |

### 3.3 Profiles and learner state

```sql
create table public.profiles (
  id                       uuid primary key references auth.users(id) on delete cascade,
  display_name             text not null default '' check (char_length(display_name) <= 40),
  app_language             text not null default 'de' references public.languages(code),
  active_language          text references public.languages(code),   -- currently learning
  timezone                 text not null default 'Europe/Berlin',      -- from expo-localization
  daily_goal_minutes       smallint not null default 15 check (daily_goal_minutes in (5,10,15,30)),
  reminder_time            time,                                       -- null = reminders off
  reminder_repeat          public.reminder_repeat not null default 'daily',
  onboarding_completed_at  timestamptz,
  -- streak cache, maintained by log_activity() (§3.5)
  streak_current           int not null default 0,
  streak_longest           int not null default 0,
  streak_last_day          date,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- One row per language the user has started. Level, target and goal are per language.
create table public.learner_languages (
  user_id         uuid not null references public.profiles(id) on delete cascade,
  language        text not null references public.languages(code),
  level           public.cefr_level not null default 'A1',
  target_level    public.cefr_level not null default 'B1',
  level_progress  numeric(4,3) not null default 0 check (level_progress between 0 and 1), -- → Kurs
  goal            public.learning_goal,                       -- "Warum lernst du Französisch?"
  started_at      timestamptz not null default now(),
  last_active_at  timestamptz,
  primary key (user_id, language),
  check (target_level >= level)
);

-- Every Einstufung: the onboarding call, the self-assessment fallback, later re-assessments.
create table public.level_assessments (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  language         text not null references public.languages(code),
  source           public.level_source not null,
  conversation_id  uuid references public.conversations(id) on delete set null,
  level            public.cefr_level not null,
  previous_level   public.cefr_level,
  evidence         jsonb not null default '[]',   -- [{text, note, score, status}] → 09 "3 Stellen"
  created_at       timestamptz not null default now()
);
```

Email is not duplicated into `profiles`; the profile and logout screens read it from
`supabase.auth.getUser()`. The `name`, `appLanguage`, `dailyGoalMinutes`, `reminder` fields of
the current `Session` schema map 1:1 to `profiles`; `learningLanguage`, `level`, `targetLevel`,
`goal` map to `learner_languages`; `plusActive` is derived from `subscriptions` (§3.6).

A trigger on `auth.users` creates the profile and the referral code:

```sql
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''));
  insert into public.referral_codes (code, user_id)
  values (public.generate_referral_code(), new.id);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();
```

### 3.4 Legal documents and consent

The welcome and account screens say "Mit … akzeptierst du die Nutzungsbedingungen und die
Datenschutzerklärung". To prove that later, the documents are versioned in the database and each
acceptance is recorded. The terms screen fetches the current document (`effective_at <= now()`,
newest first) instead of the lorem ipsum in `de.json`; the "Stand 15. September 2026" line comes
from `effective_at`.

```sql
create table public.legal_documents (
  id                     uuid primary key default gen_random_uuid(),
  kind                   public.legal_doc_kind not null,
  locale                 text not null default 'de',
  version                text not null,                 -- '2026-09-15'
  title                  text not null,
  body_md                text not null,                 -- rendered as sections in TermsScreen
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
account is created, each time with the document version that was on screen.

### 3.5 Activity and streaks

One row per user and calendar day **in the user's time zone**. Streaks, the "Heute schon 6 von 15
Min" line, the Mon–Sun circles, "Tägliches Limit erreicht" and the reset countdown are all derived
from this table. Lernen and Kurs only ever call `log_activity()`; they never touch streak fields.

```sql
create table public.daily_activity (
  user_id          uuid not null references public.profiles(id) on delete cascade,
  day              date not null,                  -- (now() at time zone profiles.timezone)::date
  seconds_learned  int not null default 0,
  conversations    int not null default 0,
  cards_reviewed   int not null default 0,         -- → Lernen
  exercises_done   int not null default 0,         -- → Lernen
  goal_minutes     smallint not null,              -- snapshot of the goal that day
  primary key (user_id, day)
);

-- Called by the app after each learning unit. Upserts today, then extends or resets the streak.
create function public.log_activity(p_seconds int, p_conversations int default 0,
                                    p_cards int default 0, p_exercises int default 0)
returns public.daily_activity language plpgsql security definer set search_path = '' as $$
declare v_profile public.profiles; v_today date; v_row public.daily_activity;
begin
  select * into v_profile from public.profiles where id = auth.uid() for update;
  v_today := (now() at time zone v_profile.timezone)::date;

  insert into public.daily_activity as a (user_id, day, seconds_learned, conversations,
                                          cards_reviewed, exercises_done, goal_minutes)
  values (v_profile.id, v_today, p_seconds, p_conversations, p_cards, p_exercises,
          v_profile.daily_goal_minutes)
  on conflict (user_id, day) do update set
    seconds_learned = a.seconds_learned + excluded.seconds_learned,
    conversations   = a.conversations   + excluded.conversations,
    cards_reviewed  = a.cards_reviewed  + excluded.cards_reviewed,
    exercises_done  = a.exercises_done  + excluded.exercises_done
  returning * into v_row;

  -- any activity counts for the streak (the design shows "2 Tage Serie" after the first exercise)
  if v_profile.streak_last_day is distinct from v_today then
    update public.profiles set
      streak_current  = case when streak_last_day = v_today - 1 then streak_current + 1 else 1 end,
      streak_longest  = greatest(streak_longest,
                          case when streak_last_day = v_today - 1 then streak_current + 1 else 1 end),
      streak_last_day = v_today
    where id = v_profile.id;
  end if;
  return v_row;
end $$;
```

Reads: `streak_current` is stale by at most one day, so the client treats it as 0 when
`streak_last_day < yesterday`. The week strip is `select day, seconds_learned from daily_activity
where user_id = auth.uid() and day >= date_trunc('week', today)`.

### 3.6 Subscriptions and conversation credits

RevenueCat owns the store subscriptions; the database mirrors the state it needs for
entitlements and keeps the credit ledger. The client never writes here; the `revenuecat-webhook`
edge function does.

```sql
-- Current subscription state per user (upserted from RevenueCat webhooks).
create table public.subscriptions (
  user_id         uuid primary key references public.profiles(id) on delete cascade,
  rc_app_user_id  text not null,           -- = profiles.id, set via Purchases.logIn()
  product_id      text,                    -- store product identifier
  plan            text,                    -- 'plus_10' | 'plus_30' (matches app_config.plans)
  status          public.subscription_status not null,
  store           text,                    -- 'app_store' | 'play_store'
  period_start    timestamptz,
  period_end      timestamptz,
  will_renew      boolean,
  updated_at      timestamptz not null default now()
);

-- Raw webhook log; the event id makes processing idempotent.
create table public.revenuecat_events (
  id            text primary key,
  type          text not null,             -- INITIAL_PURCHASE, RENEWAL, CANCELLATION, …
  app_user_id   text not null,
  payload       jsonb not null,
  received_at   timestamptz not null default now(),
  processed_at  timestamptz
);

-- Append-only ledger. Positive rows are grants, negative rows are consumption.
create table public.credit_ledger (
  id               bigint generated always as identity primary key,
  user_id          uuid not null references public.profiles(id) on delete cascade,
  bucket           public.credit_bucket not null,
  amount           int not null check (amount <> 0),
  reason           public.credit_reason not null,
  conversation_id  uuid references public.conversations(id) on delete set null,
  period_end       timestamptz,            -- monthly rows: when this month's quota expires
  ref              text,                   -- RC event id / purchase id / referral id
  created_at       timestamptz not null default now(),
  unique (reason, ref)                     -- idempotent grants
);
create index on public.credit_ledger (user_id, bucket, period_end);
```

Semantics, matching the copy on the paywall and talk-limit screens:

- **Monthly bucket** ("30 Gespräche im Monat"): each `RENEWAL` / `INITIAL_PURCHASE` webhook inserts
  `+N` with `period_end = subscription.period_end`. Consumption rows copy the same `period_end`, so
  the remaining quota is `sum(amount) where bucket='monthly' and period_end > now()`. Unused
  conversations expire with the period. "In 11 Tagen hast du wieder 30 Gespräche" = `period_end`.
- **Purchased bucket** ("Guthaben verfällt nicht und wird erst nach deinem Monatskontingent
  verbraucht"): packs and referral rewards land here with `period_end = null` and are consumed only
  when the monthly bucket is empty.
- **Trial** ("5 Tage kostenlos testen"): the store trial arrives as a subscription with
  `status='trial'`; the webhook grants `app_config.trial_conversations` into the monthly bucket with
  `period_end = trial end`.

```sql
create function public.conversation_balance()
returns table (monthly_remaining int, monthly_total int, resets_at timestamptz, purchased_remaining int)
language sql security definer set search_path = '' stable as $$
  select
    coalesce(sum(amount) filter (where bucket = 'monthly' and period_end > now()), 0)::int,
    coalesce(sum(amount) filter (where bucket = 'monthly' and period_end > now() and amount > 0), 0)::int,
    max(period_end) filter (where bucket = 'monthly' and period_end > now()),
    coalesce(sum(amount) filter (where bucket = 'purchased'), 0)::int
  from public.credit_ledger where user_id = auth.uid();
$$;
```

`consume_conversation_credit(conversation_id)` (security definer, called only by the
`start-conversation` edge function) locks the profile row, reads the balance, inserts `-1` into
`monthly` if available, else `purchased`, else raises `NO_CREDITS` → the app shows 30a
"Gespräche aufgebraucht". A conversation that fails before it really started (`duration < 30 s`,
`status='failed'`) gets a matching `+1 refund` row.

`plusActive` in the UI = `subscriptions.status in ('trial','active','billing_issue')`.

### 3.7 Referrals ("Code teilen" / "Code einlösen")

```sql
create table public.referral_codes (
  code        text primary key check (code ~ '^[A-Z0-9]{6}$'),   -- 'MAJA7K' → yori.app/MAJA7K
  user_id     uuid not null unique references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create table public.referrals (
  id           uuid primary key default gen_random_uuid(),
  code         text not null references public.referral_codes(code),
  referrer_id  uuid not null references public.profiles(id) on delete cascade,
  referred_id  uuid not null unique references public.profiles(id) on delete cascade,
  redeemed_at  timestamptz not null default now(),
  rewarded_at  timestamptz,
  check (referrer_id <> referred_id)
);
```

`redeem_referral_code(p_code)` (RPC, security definer): valid code, caller has no referral yet,
caller's account is younger than 14 days → insert the referral and grant
`referral_reward_conversations` to both users in the purchased bucket
(`reason='referral_reward'`, `ref=referral id`). The unique constraint on `referred_id` prevents
double redemption; the check prevents self-referral. Codes come from
`generate_referral_code()` (6 chars, retries on collision, avoids `0/O/1/I`).

### 3.8 Live conversations (GPT-Live-1)

The app talks to the realtime model directly (WebRTC) using a short-lived token minted by an edge
function; the database only sees the lifecycle, the transcript and the analysis. This keeps the
OpenAI key off the device and puts credit checks server-side.

```sql
create table public.conversations (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.profiles(id) on delete cascade,
  language             text not null references public.languages(code),
  kind                 public.conversation_kind not null,   -- placement | lesson | free
  status               public.conversation_status not null default 'pending',
  topic                text,                                -- 'Café in Paris' (Rückblick header)
  lesson_ref           text,                                -- → Kurs: chapter/station id, later a FK
  level                public.cefr_level,                   -- learner level when the call started
  provider             text not null default 'openai',
  model                text,                                -- e.g. 'gpt-live-1'
  provider_session_id  text,
  max_seconds          int not null default 360,
  started_at           timestamptz,
  ended_at             timestamptz,
  duration_seconds     int,
  end_reason           text,                                -- 'user' | 'max_duration' | 'error'
  summary              jsonb,                               -- analysis output (stats, tips)
  created_at           timestamptz not null default now()
);
create index on public.conversations (user_id, created_at desc);

-- Transcript, one row per utterance. Uploaded by the app at the end of the call.
create table public.conversation_turns (
  conversation_id  uuid not null references public.conversations(id) on delete cascade,
  seq              int not null,
  role             text not null check (role in ('user','assistant')),
  text             text not null,
  started_ms       int,
  ended_ms         int,
  primary key (conversation_id, seq)
);

-- What the Rückblick screen shows: captured words and "Umschrieben" paraphrases.
create table public.conversation_items (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.conversations(id) on delete cascade,
  user_id          uuid not null references public.profiles(id) on delete cascade,
  kind             text not null check (kind in ('word','paraphrase')),
  term             text not null,        -- 'la cuillère'
  meaning          text not null,        -- 'der Löffel'
  said             text,                 -- 'le truc pour remuer' (paraphrase only)
  example          text,
  saved_word_id    uuid references public.saved_words(id) on delete set null,
  created_at       timestamptz not null default now()
);

-- The learner's vocabulary ("86 Wörter gespeichert"). → Lernen adds SRS state in its own table.
create table public.saved_words (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.profiles(id) on delete cascade,
  language                text not null references public.languages(code),
  term                    text not null,
  meaning                 text not null,
  example                 text,
  source_conversation_id  uuid references public.conversations(id) on delete set null,
  created_at              timestamptz not null default now(),
  unique (user_id, language, term)
);
```

Call flow:

1. **`start-conversation`** (edge function, JWT required): body `{ language, kind, topic?,
   lesson_ref? }`. For `kind != 'placement'` it calls `consume_conversation_credit()`; for
   `placement` it allows exactly one per user (anonymous users included) and no credit. It inserts
   the `conversations` row (`status='active'`, `started_at`, `max_seconds` from config), builds the
   system prompt from `learner_languages` (level, goal) and the topic, mints the ephemeral realtime
   token, and returns `{ conversation_id, client_secret, max_seconds }`.
2. The app connects, shows the timer and cuts off at `max_seconds`.
3. **`end-conversation`**: body `{ conversation_id, transcript[], end_reason }`. Stores the turns,
   sets `ended_at`/`duration_seconds`, calls `log_activity(duration, conversations => 1)`, runs the
   analysis (words, paraphrases, short summary) and writes `conversation_items` + `summary`. For
   `kind='placement'` it also writes a `level_assessments` row and updates
   `learner_languages.level`. Refunds the credit if the call failed early.
4. The Rückblick screen reads `conversation_items`; "N Wörter speichern" inserts into
   `saved_words` and sets `saved_word_id` (state 2 "Gespeichert" = already linked).

"8 Gespräche übrig bis zur nächsten Einstufung" = `reassessment_every_n_conversations` minus the
count of ended non-placement conversations since the latest `level_assessments.created_at`.

### 3.9 Devices, notifications, feedback

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

create table public.feedback (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  rating       smallint not null check (rating between 1 and 5),
  note         text check (char_length(note) <= 240),
  app_version  text,
  created_at   timestamptz not null default now()
);
```

The daily reminder ("Pip meldet sich jeden Tag um 20:30") is best done with **local scheduled
notifications** (expo-notifications) in v1: no server, works offline, respects the picked repeat
option. `devices` exists so a server push ("Eine Lücke von heute … un café ___") can be added
later with pg_cron + an edge function without a schema change.

The rating screen copy says "Text und Sterne gehen direkt in den App Store", which is not possible
from an app. Suggested behaviour: store the row in `feedback`; if `rating >= 4` call
`StoreReview.requestReview()`.

---

## 4. Row-level security

Every table has RLS enabled. Pattern for user-owned tables:

```sql
alter table public.profiles enable row level security;
create policy "own profile: read"   on public.profiles for select using (auth.uid() = id);
create policy "own profile: update" on public.profiles for update using (auth.uid() = id);
-- no insert/delete policies: the auth trigger inserts, auth deletion cascades
```

| Table                                            | anon/auth read            | client write                              |
| ------------------------------------------------ | ------------------------- | ----------------------------------------- |
| `languages`, `app_config`, `legal_documents`     | everyone (incl. anon)     | none (service role only)                  |
| `profiles`                                       | own                       | update own                                |
| `learner_languages`, `devices`, `saved_words`    | own                       | insert/update/delete own                  |
| `legal_acceptances`, `feedback`                  | own                       | insert own                                |
| `level_assessments`, `daily_activity`            | own                       | none (RPC / edge function)                |
| `subscriptions`, `credit_ledger`, `referral_codes`, `referrals` | own        | none (webhook / RPC)                      |
| `revenuecat_events`                              | none                      | none                                      |
| `conversations`                                  | own                       | none (edge functions)                     |
| `conversation_turns`, `conversation_items`       | own (via conversation)    | none (edge functions)                     |

All `security definer` functions set `search_path = ''` and check `auth.uid()` themselves.
Anonymous users (`(auth.jwt() ->> 'is_anonymous')::boolean`) get the same policies; the only extra
restriction is enforced in `start-conversation` (placement only, once).

---

## 5. Edge functions

| Function              | Trigger                | Does                                                                 |
| --------------------- | ---------------------- | -------------------------------------------------------------------- |
| `start-conversation`  | app                    | credit check, insert conversation, mint realtime token               |
| `end-conversation`    | app                    | store transcript, analysis, placement result, activity, refunds      |
| `revenuecat-webhook`  | RevenueCat             | verify secret, log event, upsert `subscriptions`, grant credits      |
| `delete-account`      | app (09e)              | `auth.admin.deleteUser(uid)` → cascades; RevenueCat is left alone (the copy already tells the user to cancel in the store) |
| `cleanup-anonymous`   | pg_cron, daily         | delete anonymous users older than 30 days without completed onboarding |

Analytics (PostHog) does not touch the database.

---

## 6. Screen → data map

| Screen                                       | Reads                                              | Writes                                    |
| -------------------------------------------- | -------------------------------------------------- | ----------------------------------------- |
| 02b Welcome                                  | `legal_documents` (current versions)               | `signInAnonymously`, `legal_acceptances`  |
| 02c Nutzungsbedingungen / Datenschutz        | `legal_documents`                                  |                                           |
| 03 App-Sprache · 09d                         | `languages` (is_app_language)                      | `profiles.app_language`                   |
| 03a Lernsprache · 09c · 01a Sprachen         | `languages` (learnable), `learner_languages`       | `profiles.active_language`, `learner_languages` row |
| 03b Ziel                                     |                                                    | `learner_languages.goal`                  |
| 04 Name                                      |                                                    | `profiles.display_name`                   |
| 05 / 05a / 09f Erinnerung                    |                                                    | `profiles.reminder_time`, `reminder_repeat`; local notification |
| 06 → 07 → 08 → 09 Einstufung                 | `level_assessments.evidence`                       | `start-conversation` / `end-conversation` (placement) |
| 06a Level selbst                             |                                                    | `learner_languages.level`, `level_assessments` (source self) |
| 09g Ziel-Level                               |                                                    | `learner_languages.target_level`          |
| 09h / 09g Lernzeit                           | `app_config.daily_goal_options_minutes`            | `profiles.daily_goal_minutes`             |
| 11f Paywall · 13 Plus aktiv                  | `app_config.plans`, RevenueCat offerings, `subscriptions` | purchase via RevenueCat → webhook   |
| 11b Code einlösen · 15 Code teilen           | `referral_codes` (own)                             | `redeem_referral_code()`                  |
| 12 / 12b Konto                               |                                                    | `updateUser` / `linkIdentity`, `legal_acceptances`, `onboarding_completed_at` |
| 09b Profil                                   | `profiles`, `learner_languages`, `daily_activity` (week), `saved_words` count, `conversations` count | |
| 09i Einstellungen                            | `profiles`, `subscriptions`                        |                                           |
| 09e Konto löschen · 41a Abmelden             |                                                    | `delete-account` / `signOut`              |
| 02c Live-Konversation                        | `conversation_balance()`                           | `start-conversation`, `end-conversation`  |
| 3h Rückblick                                 | `conversation_items`                               | `saved_words`                             |
| 30a Gespräche aufgebraucht                   | `conversation_balance()`, `app_config.packs`       | pack purchase via RevenueCat → webhook    |
| 08b Serie · 08 Tägliches Limit               | `profiles.streak_*`, `daily_activity`              | (via `log_activity()` from Lernen)        |
| 10a Bewertung                                |                                                    | `feedback`                                |

---

## 7. Migration order and rollout

```
supabase/migrations/
  0001_extensions_enums.sql        moddatetime, pg_cron (prod), enums, updated_at trigger fn
  0002_reference.sql               languages, app_config, legal_documents (+ RLS)
  0003_profiles.sql                profiles, learner_languages, level_assessments (FK to
                                   conversations added in 0006), handle_new_user trigger
  0004_consent_devices_feedback.sql legal_acceptances, devices, feedback
  0005_activity.sql                daily_activity, log_activity()
  0006_conversations.sql           conversations, conversation_turns, conversation_items, saved_words
  0007_billing.sql                 subscriptions, revenuecat_events, credit_ledger,
                                   conversation_balance(), consume_conversation_credit()
  0008_referrals.sql               referral_codes, referrals, generate_referral_code(),
                                   redeem_referral_code()
supabase/seed.sql                  languages (de/en/es/fr/it/pt; fr learnable; de app language),
                                   app_config keys above, one terms + one privacy document,
                                   a dev user (dev@yori.app / password) with onboarding done
```

Suggested build order in the app:

1. `supabase init`, migrations 0001–0004, client + anonymous auth, `SessionProvider` on top of
   `profiles`/`learner_languages`, account conversion on step 12/12b, legal documents from the DB.
2. 0005 activity + streaks; profile screen reads real numbers.
3. 0006 conversations + the two conversation edge functions (placement call end-to-end).
4. 0007/0008 RevenueCat webhook, credit ledger, referral codes, talk-limit screen.
5. Then Lernen (flashcards SRS on top of `saved_words`, exercises, reading) and Kurs.

---

## 8. Open questions

1. Your message ended at "when we launch the app it will be available in …". Which markets /
   store regions? This decides the region (assumed Frankfurt), whether non-EUR prices are needed,
   and whether `app_language` must support more than `de` at launch.
2. Phone-number sign-in ("Mit Telefonnummer"): keep (SMS provider + cost) or route to email?
3. Sign in with Apple is required on iOS alongside Google. OK to add it to the account screen?
4. Referral reward: the copy says "1 Stunde Live-Gespräch", billing is per conversation. Convert to
   `10` conversations (≈ 1 h at 6 min) or add a minutes-based bucket?
5. 13 "Plus aktiv" says "15 Minuten Gespräch am Tag", the paywall sells 10/30 conversations per
   month. Which one is the product rule? The ledger above implements the monthly count.
6. GPT-Live-1: confirm the exact model id and token endpoint so `start-conversation` can be written
   against it; the schema only stores `model`/`provider_session_id` as text.
7. Should transcripts be kept indefinitely, or trimmed after N days once the analysis is stored
   (data-minimisation argument for the Datenschutzerklärung)?
