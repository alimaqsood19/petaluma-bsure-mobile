# bsure-mobile GitHub Actions

| Workflow | Trigger | What it does |
|---|---|---|
| `ci.yml` | every PR + push to `main` | Lint + typecheck + Vitest + Storybook smoke build + Maestro E2E (iOS Simulator on macOS runner) |
| `eas-build.yml` | push to `main` → preview profile; tag `v*` → production; manual → choose | Runs `eas build` with the chosen profile and platform |
| `eas-submit.yml` | manual only | Submits a built artifact to App Store Connect + Google Play |

## One-time GitHub configuration

### 1. Repository **secrets** (Settings → Secrets and variables → Actions → Secrets)

| Secret | Where to get it |
|---|---|
| `EXPO_TOKEN` | https://expo.dev/settings/access-tokens — create a token with project access |

That's it. Apple App-specific passwords and Google service-account JSON are managed inside EAS via `eas credentials` — they never touch GitHub.

### 2. EAS configuration (one-time, locally)

Run once from your machine after the project is bootstrapped:

```bash
eas login
eas build:configure                 # creates eas.json with the profiles
eas credentials                     # walks through Apple + Google credential setup
eas project:init                    # links to expo.dev project
```

`eas.json` is checked into the repo (it has profiles, not credentials).

## Release flow

```
PR opened       →  ci.yml  (lint, test, Storybook smoke)
                            +  Maestro E2E on macOS runner

merge to main   →  eas-build.yml @ "preview"  →  TestFlight / Play Internal
                                                  ↓
                              alpha testers install via TestFlight

create tag v1.2.3  →  eas-build.yml @ "production"
                       ↓
                       (manually trigger eas-submit.yml when build completes)
                       ↓
                       App Store + Play submission for review
```

## Notes

- Mobile builds run on **EAS infrastructure**, not GitHub runners. The workflow just orchestrates EAS.
- The `--no-wait` flag returns immediately. Track build status at https://expo.dev/accounts/petaluma/projects/bsure-mobile/builds.
- Maestro requires macOS runners (for iOS Simulator). They're slower and more expensive than Linux — only run on PR, not on every push.
