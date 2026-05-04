# bsure-mobile

React Native + Expo app for B-Sure. One of three sibling repos under the `Petaluma - B Sure/` workspace.

```
Petaluma - B Sure/
├── bsure-infra/      ← Terraform + spec set (source of truth)
├── bsure-api/        ← NestJS backend
└── bsure-mobile/     ← this repo
```

## What lives here

- `app/` — Expo Router file-based routes (sign-in, complete-profile, (tabs), boots, horses, scans)
- `src/` — domain modules: `auth/`, `ble/`, `db/` (Realm), `sync/`, `api/`, `prefs/`, `horses/`, `scans/`, `ui/`, `providers/`, `util/`
- `tokens.json` + `tamagui.config.ts` + `src/ui/` — design system (ADR 0017, ADR 0022)
- `assets/` — icons, splash, fonts (final brand assets land in T2.11)
- `.storybook/` — Storybook on RN-Web for the design system
- `docs/design-system/` — design-system docs (tokens, components, a11y)
- `test/unit/` — jest unit tests (api client, auth store, BLE store, sync logic, etc.)
- `.env.example` — required environment variables
- `eas.json` — EAS build profiles (development / preview / production)
- `app.json` — Expo config
- `STUBS.md` — what's stubbed and where the real wiring lands

## Quick start (local dev, no AWS)

This walks you from a fresh clone all the way to the B·SURE Welcome screen on iPhone 17 Pro Simulator, signed in via the LOCAL_DEV stub against the API running on your machine.

### Prerequisites

- **Node 20+** (`node -v`)
- **pnpm 11+** (`pnpm -v`; `corepack enable` or `brew install pnpm`)
- **Xcode 16+** with the iOS Simulator installed (`xcodebuild -version`)
- **CocoaPods** for native iOS pods (`pod --version`; install via `brew install cocoapods` or `sudo gem install cocoapods`)
- **Docker Desktop** running — needed by `bsure-api` (Postgres + Redis)
- **EAS CLI** (optional, only for real-device BLE) — `npm i -g eas-cli`

### 1. Start the backend (`bsure-api`)

```bash
cd ../bsure-api
cp .env.example .env             # LOCAL_DEV=true is the default — leave it
pnpm install                     # one-time
pnpm dev:up                      # = docker compose up -d --wait + migrate + nest start --watch
```

`pnpm dev:up` brings the full stack (Postgres + TimescaleDB + Redis + migrations + API) up in one command. On subsequent days `pnpm dev` is enough.

API listens on `http://localhost:3000`. Sanity-check:

```bash
curl -i http://localhost:3000/healthz
# → 200 OK { "status": "ok" }

curl -H "Authorization: Bearer dev-alice" http://localhost:3000/v1/me
# → 200 with { "user": { "cognitoSub": "local:alice", ... }, "memberships": [] }
```

`bsure-api/README.md` has the full recipe + troubleshooting.

### 2. Build + launch the mobile app on iOS Simulator

In a second terminal:

```bash
cd ../bsure-mobile
cp .env.example .env             # EXPO_PUBLIC_API_URL=http://localhost:3000 by default
pnpm install
pnpm ios                         # = expo run:ios --device "iPhone 17 Pro"
```

The first run takes 5–10 minutes (Xcode compiles ~80 React Native pods + Tamagui native bits + realm + react-native-ble-plx). Subsequent runs reuse Xcode's DerivedData and finish in 30–60 seconds.

When the build finishes you'll see:

```
› Build Succeeded
› Installing /…/BSure.app
› Installing on iPhone 17 Pro
› Opening on iPhone 17 Pro (com.petaluma.bsure)
```

Metro starts on `:8081`, the Simulator opens, and the **Welcome screen** appears with the B·SURE wordmark, a LOCAL_DEV banner, and three Continue buttons.

### 3. Walk the demo

1. **Continue with Email** → enter any dev username (e.g. `alice`) → tap Continue.
   - Mobile sends `Authorization: Bearer dev-alice` to `/v1/me`.
   - API auto-creates a `User` row with `cognitoSub=local:alice`.
2. App routes to **Complete Profile** since the new user has no `firstName`.
   - Fill in name + role (rider / trainer / etc.) + stable name + discipline.
   - Save — server-side persistence requires `PATCH /v1/me` + `POST /v1/organizations` which aren't on the API yet (see `STUBS.md`); the mobile form falls through to a "Saved locally" alert and proceeds to Home.
3. **Home tab** lists horses scoped to your barn (Realm-backed) with a sync indicator + Add a horse CTA.
4. **Quick Read** tab kicks off a no-horse scan (the BLE permission gate prompts first).
5. **Account** tab — pick OS / Light / Dark theme + temperature/height/weight units (persists across cold starts via `expo-secure-store`); sign out clears the stored token + routes back to Welcome; Delete account hits `DELETE /v1/me`.

### Path-with-spaces caveat (this workspace)

The folder name **`Petaluma - B Sure/`** has spaces. Several React Native + CocoaPods script phases unquote shell variables and break under those paths (the `Generate Specs` script calls `/bin/sh -c "$WITH_ENVIRONMENT $SCRIPT_PHASES_SCRIPT"` — both expand into paths with spaces, which the shell then word-splits).

Two things in this repo work around it:

1. **`with-environment.sh` patch** — a one-line fix in `node_modules/.pnpm/react-native@…/scripts/xcode/with-environment.sh` (changes `$1` → `"$@"`). This survives `pnpm install` because it lives inside `node_modules/.pnpm` content-addressed storage.
2. **`expo run:ios` patches `Pods.xcodeproj` after pod install** — the `Generate Specs` build phase is rewritten to call `"$WITH_ENVIRONMENT" "$SCRIPT_PHASES_SCRIPT"` (proper quoting). This is regenerated on each pod install; if you ever blow away `ios/` the next `pnpm ios` will re-apply.

If you'd rather avoid both, **rsync the project to a no-space path before building**:

```bash
mkdir -p /tmp/bsure-build
rsync -a --exclude='ios' --exclude='android' --exclude='.expo' \
       --exclude='dist' --exclude='node_modules' \
       "../bsure-mobile/" /tmp/bsure-build/
cd /tmp/bsure-build && pnpm install && pnpm ios
```

This is what we used to get a clean first build.

### Troubleshooting

- **`pnpm install` reports "Already up to date" but no `node_modules` was created.**
  A `pnpm-workspace.yaml` somewhere in your home tree (commonly `~/pnpm-workspace.yaml`)
  is making pnpm treat this repo as part of an outer workspace. The committed
  `pnpm-workspace.yaml` at the repo root marks this directory as the workspace
  root for pnpm and avoids the issue. If you still see it, run
  `pnpm install --ignore-workspace` once.
- **Xcode build fails with `error: /Users/.../Petaluma: No such file or directory`** during `[CP-User] Generate Specs` or any `bash -c "$VAR"` PhaseScriptExecution.
  This is the path-with-spaces issue described above. Either re-apply the
  `with-environment.sh` + `Pods.xcodeproj` patches, or build from `/tmp/bsure-build`.
- **`pnpm install` fails on `expo` peer-dep mismatches.** Check `node -v` is 20+
  and `pnpm -v` is 11+. Run `pnpm install --strict-peer-dependencies=false` once
  to confirm whether the mismatch is in your tree or in our lockfile.
- **iOS Simulator never launches.** Make sure Xcode is installed and the
  command-line tools point at it: `sudo xcode-select -s /Applications/Xcode.app`.
- **Metro bundler crashes on `react-native-reanimated` import.** Verify
  `babel.config.js` includes `'react-native-reanimated/plugin'` (it does in
  the committed copy). Then `pnpm start --clear`.
- **App boots, Welcome screen renders, but `/v1/me` returns 401.** The mobile app sends
  `Authorization: Bearer <EXPO_PUBLIC_DEV_BEARER>`; make sure the API was
  started with `LOCAL_DEV=true` (the default in `.env.example`).
- **`createTamagui() invalid tokens.zIndex`** — `tamagui.config.ts` maps semantic zIndex names to the size scale (numeric keys) because Tamagui's createTokens validates against the size scale; T2.11 will revisit.
- **`Cannot read properties of undefined (reading 'registerWorker')`** when running `bsure-api`'s `pnpm dev` — your local copy is on the legacy `tsx watch` script. Pull the latest `bsure-api`; the script is now `nest start --watch` + `dotenv` autoload.

### BLE testing on a real device

`react-native-ble-plx` only registers its native module on a real device. To exercise pairing + scan capture against an actual Smart Boot:

```bash
eas build --profile development-device --platform ios   # or --platform android
```

Install the artifact, then run `pnpm start` here — the dev client connects to your laptop's Metro server. See `docs/runbooks/ble-dev.md` (TBD).

## Tests

```bash
pnpm test         # jest unit tests (~41 across api client, auth, BLE, sync, schemas, etc.)
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
