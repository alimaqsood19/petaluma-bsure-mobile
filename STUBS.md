# Stubs & follow-ups (mobile)

Things landed in this repo that are deliberately incomplete and need a real
wiring step later. Mirror of `../bsure-api/STUBS.md`. Audit this list before
shipping a deployed build.

> Format: `[severity] file:symbol — short note  →  resume in TX.YY`
>
> Severity: **block-prod** (must replace before any deployed env / store
> submission), **block-paid** (before paid features ship), **soft**
> (improves a path already covered by another guard).

## Bootstrap (T0.05 / T1.15)

- **soft** `tsconfig.json` excludes the legacy design-system files
  (`src/ui/Button.tsx`, `Text.tsx`, `Toggle.tsx`, `Modal.tsx`, `Pill.tsx`,
  `Card.tsx`, `Header.tsx`, `BottomNav.tsx`, `Tab.tsx`, `Input.tsx`,
  `ThemeProvider.tsx`, `tokens-loader.ts`, `index.ts`, plus their
  `.stories.tsx`) and `.storybook/**` from `pnpm typecheck`. Those files
  were scaffolded against an older Tamagui type shape and have type
  errors against current Tamagui (Text/Toggle font-size tokens,
  variant casts). They aren't imported by the running app yet — the
  bottom-nav scaffold uses Tamagui primitives directly. T1.36/T1.37
  (design-system polish) will refit them and re-include in typecheck.
  → resume in **T1.36/T1.37**.

- **soft** Inter font is referenced by `tamagui.config.ts` via
  `@tamagui/font-inter`'s `face` mapping (`Inter-Regular`, etc.) but
  the actual font files aren't loaded via `expo-font` yet. RN falls
  back to system font, which is fine visually but produces a yellow
  warning at runtime. Final font loading lands with the T2.11 brand
  polish pass. → resume in **T2.11**.

- **soft** `assets/` icons + splash images are placeholders inherited
  from the design-system scaffold. Final brand assets land with the
  T2.11 design polish pass. → resume in **T2.11**.

## Nav (T1.15)

- **soft** Bottom-nav tab icons are placeholder geometric shapes from
  `src/ui/nav/TabIcon.tsx`. Final iconography lands with T2.11 design
  polish (or sooner via Claude Design hand-off — see
  `docs/design-system/claude-design-handoff.md`). → resume in **T2.11**.

## Profile completion (T1.17 — backend gap)

- **block-prod** `src/auth/authStore.ts:completeProfile` — the bsure-api
  controllers do not yet expose `PATCH /v1/me` (profile fields + prefs)
  or `POST /v1/organizations`. The mobile form sends both calls but
  treats a 404 as "backend isn't ready" and falls through to a local-
  only profile (sets `firstName/lastName/role` on the in-memory user
  so the auth gate routes to /(tabs)) plus a UI alert telling the
  tester their profile is local-only. Once both endpoints land, the
  same call path will persist server-side and `refreshMe()` will
  clear `profileCompletedLocally`. → resume in **bsure-api PATCH
  /v1/me + POST /v1/organizations** (no task id yet — surface as a
  coordinated PR set against bsure-api).

## Auth (T1.16)

- **block-prod** `src/auth/cognito.ts` — `COGNITO_POOL_READY = false`.
  All sign-in entry points (`signInWithProvider('apple' | 'google' |
  'email')`) currently delegate to the LOCAL_DEV stub bearer per
  ADR 0021. Real native Apple via `expo-apple-authentication`,
  Google via `react-native-google-signin`, and Cognito Hosted UI for
  email lands once **T1.01.6** (dev pool) is `[x]`. Until then the
  Welcome screen renders a "LOCAL_DEV MODE" banner so testers know.
  → resume **T1.01.6** + an auth-wiring follow-up.

- **block-prod** Token refresh is unimplemented — a 401 from /v1/me
  signs the user out instead of attempting the Cognito refresh-token
  flow. Acceptable while LOCAL_DEV bearers don't expire; must be
  wired before deployed envs. → resume alongside **T1.01.6**.

- **soft** `app/sign-in.tsx` — the "Continue with Email" path takes a
  raw dev userid rather than email + password. Real email/password
  signup (F1.5 — email verification) doesn't render until the
  Cognito pool exists. → resume alongside **T1.01.6**.

## BLE (T1.18 / T1.20)

- **soft** `src/ble/permissions.ts` instantiates `BleManager` lazily with
  `new mod.BleManager()` and never disposes it. Acceptable while the
  scan flow doesn't run yet, but T1.20 must replace this with a single
  shared manager instance whose lifecycle the BLE state machine owns
  (so the app doesn't hold a CBCentralManager handle just to read the
  permission state). → resume in **T1.20**.

- **soft** Android API-level branching uses the `Platform.Version`
  number directly. Phase-2 Android polish should pull a typed helper
  (e.g. `isAndroid12OrNewer()`) so this isn't repeated each time we
  add a new BLE permission. → resume **T2.11** or first Android-side
  alpha task.

- *(BLE state machine + Boot pairing entries land in T1.20.)*

## Realm (T1.19)

- **soft** Realm CRUD round-trip (T1.19 DoD requires "an integration test
  creates, reads, and updates a Horse without errors") is verified by
  schema-shape unit tests in node + a Maestro flow planned in **T1.32**.
  Realm's node binding isn't built in our jest env, so the actual
  `Realm.open()` round-trip runs in the dev client / on-device only.
  → resume in **T1.32** Maestro signup → create-horse flow.

- **soft** No migrations defined yet (REALM_SCHEMA_VERSION = 1). When any
  schema property changes shape, bump the version and add a copy step
  inside `onMigration` in `src/db/realm.ts`. → resume per change.

## Sync (placeholder until T1.25)

- *(none yet — entries land as T1.25 builds the outbound queue + delta pull.)*

## Push (placeholder until T2.20)

- *(none yet — entries land when push registration is wired.)*

## Stripe (gated on payment-approach decision)

- **gated on decision** — all checkout / subscription UI (T1.28, T2.23)
  is deferred until Ali confirms the payment approach. Mirror of the
  same gate in `bsure-api/STUBS.md`.

## CI

- **block-prod** EAS build profile `development` is defined but no GitHub
  Actions workflow triggers it on tag yet. → resume **T1.03** (mobile CI
  pipeline).

## Versioning

- **soft** `app.json` `version` is hand-managed for Phase 0. EAS remote
  versioning + `autoIncrement` is on for the `production` profile but the
  `development` / `preview` profiles still rely on `app.json`. Acceptable
  pre-alpha. → revisit at T1.32 / first TestFlight cut.
