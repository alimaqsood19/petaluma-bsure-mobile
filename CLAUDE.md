# bsure-mobile — Claude Code project memory

> Loaded automatically when Claude Code starts in this directory. Scoped to the **React Native / Expo app only**. For full product/architecture context, see the master spec set at `../bsure-infra/specs/`.

## Repo scope

This repo is **only** the mobile client. Do not modify backend or infrastructure code from here. If a change requires sibling-repo edits (e.g., a new API endpoint), stop and surface as a coordinated PR set.

Sibling repos (relative paths):

- `../bsure-infra/` — Terraform + spec set + runbooks (source of truth)
- `../bsure-api/` — NestJS backend

## What this repo delivers (Phase 1)

Implements these spec sections (see `../bsure-infra/specs/spec.md`):

- **F1.\*** — auth & onboarding screens
- **F3.\*** — horse list, horse profile, create/edit horse forms
- **F5.\*** — Smart Boot pairing UX, multi-boot adjacency
- **F6.\*** — scan capture flow (5 steps), Quick Read, offline-first save
- **F7.\*** — visualizations (heat-map grid, 3D model, calendar) — Phase 2
- **F8.\*–F9.\*** — alerts feed, push registration — Phase 2
- **F10.\*** — settings (theme, units, account)
- All mobile-side NFRs.

Tasks scoped to this repo (per `../bsure-infra/specs/tasks.md`): **T1.15–T1.26, T1.31, T1.32** plus Phase 2 mobile tasks.

## Locked-in stack

- **Framework:** React Native 0.79 + Expo SDK 53 (ADR 0005)
- **Language:** TypeScript strict
- **Routing:** Expo Router 5 (file-based) — root `_layout.tsx` renders `<Stack>` alongside (not wrapping) `<AuthGate>` so the navigator is mounted before any redirect runs
- **Styling / UI primitives:** **Tamagui 1.144** (ADR 0022 — supersedes NativeWind from ADR 0005)
- **Design system:** `tokens.json` at repo root + `src/ui/` component library + Storybook on RN-Web (ADR 0017, ADR 0022)
- **Local DB:** Realm 20 + custom REST sync (ADR 0005)
- **State:** Zustand (per-domain stores: `auth`, `ble`, `prefs`, `horses`, `sync`, `scans/captureStore`, `ble/pairing`, `ble/adjacency`)
- **BLE:** `react-native-ble-plx` v3 — TempPulse service `1e265423-...` (ADR 0009)
- **3D:** `@react-three/fiber` + Three.js
- **Push:** Expo Push (APNs/FCM relay)
- **Errors:** Sentry (`SENTRY_DSN` via app config extra)
- **Tests:** Jest + babel-jest (unit) + Maestro (E2E)
- **Builds:** `pnpm ios` for local dev (Xcode + CocoaPods) · EAS Build + EAS Submit for distribution

### Identifier generation

We do **not** use the `uuid` package's crypto-backed v7 — Hermes lacks `crypto.getRandomValues()` and adding `react-native-get-random-values` requires its native module to be linked in (autolinking issues under pnpm). `src/db/realm.ts:newId()` is a self-contained UUIDv7-shaped generator (timestamp prefix + `Math.random()` suffix). Sufficient for client-side identifiers used as the API's `clientId` for idempotency.

## Inviolable principles (subset)

- **E1.** Local-first. Always. A scan started offline must complete offline. Realm is the source of truth on the device during a scan.
- **E2.** Append-only. Edits create new versions; deletes are tombstones. UI never destructively mutates a synced record.
- **E6.** Hardware contract is fixed. The 184-sensor payload, the TempPulse UUIDs, the ASCII "ST" start command — these don't change.
- **P2.** Non-diagnostic. Alert copy and any user-facing observation must read like an observation, not a verdict.
- **P3.** The barn is the environment. Designs assume bad cellular signal, gloves, mud, glare.

Full constitution: `../bsure-infra/specs/constitution.md`.

## Local development

The mobile app talks to the backend at `EXPO_PUBLIC_API_URL` (defaults to `http://localhost:3000`). When the backend runs in `LOCAL_DEV=true` mode, the mobile app sends `Authorization: Bearer dev-<userid>` and any value works (see ADR 0021).

End-to-end recipe (full version in `README.md`):

```bash
# Terminal A — backend (one command brings the full stack up)
cd ../bsure-api && cp .env.example .env && pnpm install && pnpm dev:up

# Terminal B — mobile (iOS Simulator with BLE + Realm linked)
cd ../bsure-mobile && cp .env.example .env && pnpm install && pnpm ios
```

`pnpm ios` runs `expo run:ios --device "iPhone 17 Pro"`. First build is 5–10 minutes (Xcode compiles ~80 RN pods); subsequent runs reuse DerivedData. Expo Go is **not** sufficient because the bundle imports `realm` and `react-native-ble-plx` natively.

### Path-with-spaces caveat

The workspace folder name `Petaluma - B Sure/` contains spaces, which trips two React Native build-script phases (unquoted `bash -c "$VAR"` calls). Two patches in this repo work around it:

1. `node_modules/.pnpm/react-native@…/scripts/xcode/with-environment.sh` — changed `$1` → `"$@"`.
2. `ios/Pods/Pods.xcodeproj` — `[CP-User] Generate Specs` build phase rewritten to quote `"$WITH_ENVIRONMENT" "$SCRIPT_PHASES_SCRIPT"` after pod install.

The cleanest alternative is to build from a no-space path:

```bash
mkdir -p /tmp/bsure-build
rsync -a --exclude=ios --exclude=android --exclude=.expo \
       --exclude=dist --exclude=node_modules \
       . /tmp/bsure-build/
cd /tmp/bsure-build && pnpm install && pnpm ios
```

For BLE testing on a real device, use `eas build --profile development-device --platform ios`, install the artifact, then run `pnpm start` — the dev client connects to your laptop's Metro server.

## Anti-vocabulary (don't say these in copy or comments)

| Don't say | Say |
|---|---|
| Athlete | Horse |
| Device (when meaning Boot) | Boot or Smart Boot |
| Measurement | Scan |
| Symptom / Diagnosis | Pattern / Observation / Elevated reading |
| Account (as data scope) | Barn or Organization |

Full glossary: `../bsure-infra/specs/glossary.md`.

## Design system — `src/ui/` + `tokens.json`

The design system is **partially built** as of 2026-05-01:

- `tokens.json` (root) — canonical design tokens (colors, typography, spacing, radii, shadows, motion). v0.1 inferred from raster wireframes; calibrate from Figma source via Claude Design (see `docs/design-system/claude-design-integration.md`).
- `tamagui.config.ts` — wires tokens into Tamagui's `createTokens` + `createTheme`.
- `src/ui/` — 10 core components: Button, Pill, Input, Text, Card, Modal+BottomSheet, Tab, Header, BottomNav, Toggle. Plus ThemeProvider.
- `.storybook/` — Storybook RN-Web setup with one story per component, a11y addon enabled.
- `docs/design-system/` — README, tokens reference, components, accessibility, Claude Design integration, contributing.

**Rules for any UI work:**
1. Import from `src/ui` — never reimplement primitives.
2. Reference theme tokens (`$primary`, `$space.4`, `$colorMuted`) — never hard-code values.
3. Color is never the sole indicator of meaning (constitution N5.3).
4. Hit targets ≥ 44×44 pt (constitution N5.4).
5. Add Storybook stories for new components.

Phase 2 will add domain components: Gauge, HeatMapCell, HeatMapGrid, LegPicker, LegModel3D, Calendar, StackedBar, AlertCard, BootCard.

## How to start work

1. Read `../bsure-infra/specs/tasks.md`. Find a task scoped to this repo (`Track: M`).
2. Read its Spec ref(s) and any cited ADRs.
3. Mark `[~]` in tasks.md (commit in `bsure-infra`). Implement here.
4. PR title: `T1.XX: <task title>`. Link to the spec ref.
5. Maestro flow updated when adding a major UX path.

## Version

| Version | Date | Notes |
|---|---|---|
| 1.0 | 2026-04-30 | Initial scoped CLAUDE.md for the bsure-mobile repo. Tied to spec-set v0.3. |
| 1.1 | 2026-05-04 | Phase 1 mobile shipped (T0.05, T1.15–T1.26). Added local-dev recipe, path-with-spaces patches, custom UUIDv7 generator note, Expo Router 5 / Tamagui 1.144 / RN 0.79 / Realm 20 versions. |
