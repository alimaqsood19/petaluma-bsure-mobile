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
- `assets/` — icons, splash, fonts
- `test/` — unit + Maestro E2E flows
- `.env.example` — required environment variables
- `eas.json` — EAS build profiles (dev / preview / production)
- `app.json` — Expo config

## Quick start (local dev, no AWS)

Prereqs: Node 20+, `pnpm` (or `npm`), Xcode (iOS) or Android Studio (Android), [EAS CLI](https://docs.expo.dev/eas/) (`npm i -g eas-cli`).

```bash
# 1. Copy env template
cp .env.example .env
# Edit .env to set EXPO_PUBLIC_API_URL (point at the running bsure-api)

# 2. Install deps
pnpm install

# 3. Make sure bsure-api is running locally:
#    cd ../bsure-api && docker compose up -d && pnpm dev

# 4. Start Expo
pnpm start

# Then press `i` for iOS simulator, `a` for Android emulator,
# or scan the QR with the Expo Go app on a real device.
```

For BLE testing you need a real device — Expo Go won't bundle the BLE native module. Use a development build (`eas build --profile development`).

## Spec set

The authoritative product/architecture/task docs live in [`../bsure-infra/specs/`](../bsure-infra/specs/). Read `spec.md`, `plan.md`, and the relevant section of `tasks.md` before adding screens, flows, or BLE state-machine changes.

## Working with Claude Code

1. `cd` into this directory.
2. Run `claude`.
3. The repo's `CLAUDE.md` is loaded automatically. It tells Claude what scope to operate in (this repo only, and which spec sections apply).
4. For spec edits / ADR creation / validator runs, `cd ../bsure-infra && claude` instead.

## EAS

`eas.json` defines build profiles:

- `development` — internal dev client with debug enabled, BLE module included.
- `preview` — TestFlight / internal track distribution for alpha testers.
- `production` — App Store / Play release builds.

CI builds via EAS on tagged releases. See `../bsure-infra/specs/tasks.md` T1.03 for the pipeline.
