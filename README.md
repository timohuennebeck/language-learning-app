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

## Visual verification against the design

The design export was rendered headlessly and each device frame saved to `design/reference/`.
To compare the app with it:

```
npx playwright install chromium
npm run web                       # terminal 1
npm run screens:app               # terminal 2 → design/compare/<screen>.png (reference | app)
npm run screens:measure 09b-profile 200   # pixel runs at x=200 for both images
```

On web the app simulates iPhone 16 Pro safe-area insets so the layout matches the frames. The
references were rendered without the design's Inter web font for semibold text (the exporter's
fallback), so headings look wider there; the app uses the real Inter faces.

## Known design inconsistencies kept as designed

- 06a "Level selbst wählen" shows the badges A2 / A1 / B1 / B2 next to beginner → advanced.
- All three reading screens show "Abschnitt 2 von 3"; the app derives the label from the state.
- The design mixes "Maja" and "Timo"; the app always uses the name from the session.

## Next steps (not in scope yet)

- Supabase: replace `features/auth/lib/session-store.tsx` and the `data/repository.ts` mocks;
  the query keys and hooks stay.
- RevenueCat: feed `PaywallScreen` / `TalkLimitScreen` plans from offerings.
- PostHog: add the provider in `shared/components/AppProviders.tsx`.
