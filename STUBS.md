# Stubs & follow-ups (mobile)

Things landed in this repo that are deliberately incomplete and need a real
wiring step later. Mirror of `../bsure-api/STUBS.md`. Audit this list before
shipping a deployed build.

> Format: `[severity] file:symbol — short note  →  resume in TX.YY`
>
> Severity: **block-prod** (must replace before any deployed env / store
> submission), **block-paid** (before paid features ship), **soft**
> (improves a path already covered by another guard).

## Bootstrap (T0.05)

- **soft** `app/index.tsx` — the placeholder home screen renders plain
  React Native components, not Tamagui. The `tamagui.config.ts` and
  `src/ui/*` component library exist but aren't wired into the entry yet.
  → resume in **T1.15** (project bootstrap layers in Tamagui provider +
  Expo Router nav scaffold + bottom tabs).

- **soft** `tsconfig.json` excludes `tamagui.config.ts`, `src/ui/**`, and
  `.storybook/**` from `pnpm typecheck`. Those files were scaffolded
  against an older Tamagui type shape and have ~80 pre-existing type
  errors (Text/Toggle font-size token names, optional-index access in
  `tokens-loader.ts`). T1.15 owns wiring Tamagui into the entry and is
  the right scope to either re-pin Tamagui or update the design-system
  types so they re-include cleanly. → resume in **T1.15**.

- **soft** `babel.config.js` — `@tamagui/babel-plugin` is installed but
  not enabled. The compile-time optimizer ADR 0022 calls for is therefore
  not running yet. Bundle size is fine for Phase 0 placeholder; the plugin
  flips on with the Tamagui provider wiring. → resume in **T1.15**.

- **soft** `assets/` icons + splash images are placeholders inherited
  from the design-system scaffold. Final brand assets land with the
  T2.11 design polish pass. → resume in **T2.11**.

## Auth (placeholder until T1.16)

- *(none yet — entries land as T1.16 wires Cognito + LOCAL_DEV stub bearer.)*

## BLE (placeholder until T1.20)

- *(none yet — entries land as T1.20 builds the BLE state machine.)*

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
