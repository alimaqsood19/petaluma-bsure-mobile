# bsure-mobile

React Native + Expo app for B-Sure. One of three sibling repos under the `Petaluma - B Sure/` workspace.

```
Petaluma - B Sure/
├── bsure-infra/      ← Terraform + spec set (source of truth)
├── bsure-api/        ← NestJS backend
└── bsure-mobile/     ← this repo
```

## What lives here

- `app/` — Expo Router file-based routes
- `src/` — domain modules (auth, ble, db, sync, api, state, ui, features)
- `tokens.json` + `tamagui.config.ts` + `src/ui/` — design system (ADR 0017, ADR 0022)
- `assets/` — icons, splash, fonts
- `.storybook/` — Storybook on RN-Web for the design system
- `docs/design-system/` — design-system docs (tokens, components, a11y)
- `test/` — unit + Maestro E2E flows
- `.env.example` — required environment variables
- `eas.json` — EAS build profiles (development / preview / production)
- `app.json` — Expo config
- `STUBS.md` — what's stubbed and where the real wiring lands

## Quick start (local dev, no AWS) — ≤ 10 minutes

**Prerequisites**

- Node 20+ (`node -v`)
- pnpm 9+ (`pnpm -v`; `corepack enable` or `brew install pnpm`)
- Xcode (iOS Simulator) or Android Studio (Android Emulator)
- For real-device BLE testing: [EAS CLI](https://docs.expo.dev/eas/) (`npm i -g eas-cli`)

**Steps**

```bash
# 1. Copy env template
cp .env.example .env
# Default EXPO_PUBLIC_API_URL=http://localhost:3000 works for the iOS Simulator.
# For a real device on the same wifi, set it to http://<your-machine-ip>:3000.

# 2. Install deps
pnpm install

# 3. Make sure bsure-api is running locally:
#    cd ../bsure-api && docker compose up -d && pnpm dev

# 4. Start Expo (uses the dev client by default — falls back to Expo Go for the
#    placeholder screens that don't need native modules).
pnpm start

# Then press `i` for iOS Simulator, `a` for Android Emulator, or scan the QR
# with the Expo Go app. (Expo Go works for the placeholder screens but cannot
# include the BLE native module — see "BLE testing" below.)
```

The placeholder Home screen displays the configured API URL and the build
version, which is enough to confirm the bootstrap is wired correctly. Real
screens land in T1.15+.

### BLE testing

`react-native-ble-plx` is a native module — Expo Go cannot include it. To
exercise BLE flows you need a development build:

```bash
# Build for the iOS Simulator (no provisioning, fast):
eas build --profile development --platform ios

# Build for a real iOS device (requires Apple developer account + provisioning):
eas build --profile development-device --platform ios

# Build for an Android device:
eas build --profile development --platform android
```

Then install the artifact on the device and run `pnpm start` — the dev client
will connect to your laptop's Metro server. See `docs/runbooks/ble-dev.md` (TBD).

### Troubleshooting

- **`pnpm install` reports "Already up to date" but no `node_modules` was created.**
  A `pnpm-workspace.yaml` somewhere in your home tree (commonly `~/pnpm-workspace.yaml`)
  is making pnpm treat this repo as part of an outer workspace. The committed
  `pnpm-workspace.yaml` at the repo root marks this directory as the workspace
  root for pnpm and avoids the issue. If you still see it, run
  `pnpm install --ignore-workspace` once.
- **`pnpm install` fails on `expo` peer-dep mismatches.** Check `node -v` is 20+
  and `pnpm -v` is 9+. Run `pnpm install --strict-peer-dependencies=false` once
  to confirm whether the mismatch is in your tree or in our lockfile.
- **iOS Simulator never launches.** Make sure Xcode is installed and the
  command-line tools point at it: `sudo xcode-select -s /Applications/Xcode.app`.
- **Metro bundler crashes on `react-native-reanimated` import.** Verify
  `babel.config.js` includes `'react-native-reanimated/plugin'` (it does in
  the committed copy). Then `pnpm start --clear`.
- **App boots but `/v1/me` returns 401.** The mobile app is sending
  `Authorization: Bearer <EXPO_PUBLIC_DEV_BEARER>`; make sure the API was
  started with `LOCAL_DEV=true` (the default in `.env.example`).

## Tests

```bash
pnpm test         # unit tests (jest-expo) — placeholder until T1.15+
pnpm typecheck    # tsc --noEmit (strict)
pnpm lint         # eslint (expo config)
```

Maestro E2E flows live in `test/e2e/` and are wired in T1.32.

## Spec set

The authoritative product/architecture/task docs live in [`../bsure-infra/specs/`](../bsure-infra/specs/). Read `spec.md`, `plan.md`, and the relevant section of `tasks.md` before adding screens, flows, or BLE state-machine changes.

## Working with Claude Code

1. `cd` into this directory.
2. Run `claude`.
3. The repo's `CLAUDE.md` is loaded automatically. It tells Claude what scope to operate in (this repo only, and which spec sections apply).
4. For spec edits / ADR creation / validator runs, `cd ../bsure-infra && claude` instead.

## EAS

`eas.json` defines build profiles:

- `development` — internal dev client, BLE module included, **iOS Simulator** target by default.
- `development-device` — same as `development` but for a real iOS device (requires provisioning).
- `preview` — internal distribution (TestFlight + Play Internal track) for alpha testers.
- `production` — App Store / Play release builds with auto-incrementing build numbers.

CI builds via EAS on tagged releases. See `../bsure-infra/specs/tasks.md` T1.03 for the pipeline.
