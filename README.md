# Yori

Expo app implementing the **Yori v4** screens from the Claude Design project (German UI, learning
French). This iteration ships the UI only: every screen from the design canvas is built with
placeholder data, navigation and interaction wired up, ready for Supabase, RevenueCat and PostHog
to be connected next.

## Stack

| Concern    | Choice                                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| Platform   | Expo SDK 57, Expo Router (file based, [protected routes](https://docs.expo.dev/router/advanced/protected/)) |
| Styling    | NativeWind 4 (Tailwind 3) with design tokens in `tailwind.config.js`, `cn()` via `extendTailwindMerge`      |
| Icons      | Heroicons (`react-native-heroicons`) plus a few bespoke `react-native-svg` glyphs                           |
| Data       | TanStack Query 5 with `@lukemorales/query-key-factory` key registry, optimistic mutations                   |
| Validation | Zod schemas for all domain/session data                                                                     |
| i18n       | i18next + react-i18next, `de` (default) and `en`                                                            |
| Haptics    | `expo-haptics` through the shared `Tap` / `Button` primitives                                               |
| Tooling    | TypeScript strict, ESLint (expo + tanstack query), Prettier (tailwind plugin)                               |

## Structure

```
app/                     Expo Router routes (thin re-exports of feature screens)
  _layout.tsx            providers, fonts, Stack.Protected groups
  (onboarding)/          22 onboarding steps (only reachable until onboarding is complete)
  (app)/                 the product (only reachable after onboarding / later: a session)
  dev/                   index of every design screen (development only)
src/
  features/<feature>/    components · data (schemas, repository, query keys) · hooks
    auth                 mock session store (stand-in for Supabase auth)
    onboarding           welcome → … → widget (OnboardingFrame, OptionCard)
    lessons              home, languages, lesson start, chapter + stations/ (card, row, chips)
    exercises            exercise flow: steps/ (FillOptions, FillFree, Build, TranslateFree),
                         useExerciseSession, FeedbackCard, preparing, error
    reading              reading sections, tappable segments, word explanation
    flashcards           swipe deck: useSwipeDeck, SwipeCard, DoneCard
    profile              profile (StreakCard, LevelCard, StatTiles, ProfileRow) + settings screens
    grammar, review, live, progress, paywall, dev
  shared/
    ui/                  primitives: Text, Tap, Button, Screen, TopBar, Kicker, Marks, Ring,
                         Gradient (CardGradient), RecommendedBadge, Illustration, icons…
    components/          composed pieces used by several features: HomeHeader, HeroCarousel,
                         Previews, DailyGoal, TimePicker, Hint, PipTip, SelectRow, LearningLanguageList…
    hooks/               useAppFonts, useBack / useGoHome
    lib/                 cn, haptics, i18n, storage, time, query client
    data/                query key registry
    locales/             de.json, en.json
    theme/               tokens.ts (source of truth), generated tokens.cjs, global.css
assets/illustrations/    Pip artwork and avatar (webp)   assets/flags/  flag svgs
design/reference/        one PNG per design screen, captured from the Claude Design export
design/screens.json      route + reference mapping used by the verification scripts and dev index
```

File naming: every file and folder is kebab-case (`profile-screen.tsx`, `use-swipe-deck.ts`,
`pip-wave.webp`), matching the current Expo template; exported identifiers stay PascalCase for
components and camelCase for hooks (`profile-screen.tsx` exports `ProfileScreen`). Route files in
`app/` are the URL segments. Screens end in `-screen`, onboarding steps in `-step`, hooks start
with `use-`; each feature's `data/` holds `schemas.ts`, `repository.ts`, `keys.ts`, `content.ts`.

Conventions: every tappable element is a `Tap` (haptics + button role); uppercase micro-labels are
`Kicker`; pill CTAs are `Button` variants; screens never import from another feature's
`components` folder, shared pieces live in `src/shared`.

`npm run tokens` regenerates `tokens.cjs` after editing `tokens.ts`.

## Run

```
npm install
npm run ios        # or: npm run android / npm run web
npm run lint && npm run typecheck && npm run format:check
```

Open `/dev` in development for a list of all 64 screens. Onboarding state lives in AsyncStorage
(`yori.session.v1`); "Konto löschen" resets it.

## Database (Supabase)

The schema lives in `supabase/` (migrations are the source of truth, `seed.sql` holds reference
data and a dev user); the reasoning is in `docs/database-plan.md`.

```
cp .env.example .env.local && cp supabase/.env.example supabase/.env.local
npm run db:start          # local stack via Docker (API :54321, Studio :54323, Mailpit :54324)
npm run db:reset          # replay migrations + seed
npm run db:types          # regenerate src/shared/lib/database.types.ts
```

Dev login after `db:reset`: `dev@yori.app` / `password`. The hosted project's URL and publishable
key are listed (commented out) in `.env.example`; the app refuses to start without both variables.
Keys follow Supabase's current model: the app ships the **publishable** key (`sb_publishable_…`),
edge functions use the **secret** key (`sb_secret_…`) that Supabase injects as
`SUPABASE_SECRET_KEYS`; the legacy `anon` / `service_role` JWT keys are not used anywhere.

How the app uses it: on first launch it signs in anonymously and upserts its own `profiles` row,
so every onboarding step writes real rows; the account step turns the anonymous user into an
email account (`SessionProvider` in `features/auth/lib/session-store.tsx`). Logout and account
deletion (edge function `delete-account`) start a fresh anonymous session. Types come from
`npm run db:types` (or the Supabase MCP) into `src/shared/lib/database.types.ts`.

Edge functions live in `supabase/functions/` (Deno, excluded from the app's TypeScript project):

```
npm run functions:serve                      # local, reads supabase/.env.local
npx supabase functions deploy delete-account # hosted
```

## Visual verification against the design

The design export was rendered headlessly and each device frame saved to `design/reference/`.
To compare the app with it:

```
npx playwright install chromium
npm run web                       # terminal 1
npm run screens:app               # terminal 2 → design/compare/<screen>.png (reference | app)
npm run screens:measure 09b-profile 200   # pixel runs at x=200 for both images
```

The screenshot script seeds the old AsyncStorage session; since the session now comes from
Supabase, "onboarded" screens need a signed-in browser profile (or the dev user) to render.

On web the app simulates iPhone 16 Pro safe-area insets so the layout matches the frames. The
references were rendered without the design's Inter web font for semibold text (the exporter's
fallback), so headings look wider there; the app uses the real Inter faces.

## Known design inconsistencies kept as designed

- 06a "Level selbst wählen" shows the badges A2 / A1 / B1 / B2 next to beginner → advanced.
- All three reading screens show "Abschnitt 2 von 3"; the app derives the label from the state.
- The design mixes "Maja" and "Timo"; the app always uses the name from the session.

## Next steps (not in scope yet)

- Supabase: auth, profiles, learner languages, legal documents and flashcards are wired; the
  live-conversation edge functions (`start-conversation`, `end-conversation`) and the lessons /
  flashcard-deck repositories still use the design's sample data (see `docs/database-plan.md`).
- RevenueCat: feed `PaywallScreen` / `TalkLimitScreen` plans from offerings.
- PostHog: add the provider in `shared/components/app-providers.tsx`.
