# Claude Design ↔ Code integration

The design system's central discipline: **`tokens.json` is the contract between visual design and code.** When a designer changes a color or spacing in Figma (via Claude Design at https://claude.ai/design/), the change flows back into `tokens.json`, and the React Native components inherit it on the next build — no manual sync.

## The round-trip

```
   ┌──────────────────────────────────┐
   │      tokens.json (source)        │
   └──────────────┬───────────────────┘
                  │ (consumed by both)
       ┌──────────┴───────────────┐
       │                          │
       ▼                          ▼
  ┌──────────┐             ┌──────────────┐
  │ Tamagui  │             │ Claude Design│
  │ runtime  │             │   + Figma    │
  └──────────┘             └──────────────┘
       ▲                          │
       │                          │ (designer iterates)
       └──────────────────────────┘
                  │
            updated tokens.json
                (PR back)
```

Two sides:

- **Code side** (this repo): `tokens.json` → `tamagui.config.ts` → components.
- **Visual side** (Claude Design): `tokens.json` → on-brand mockups in Figma → screen designs for unbuilt features.

A design change merges via a single PR that updates `tokens.json`. Both sides pick up the new value automatically.

## Setting up Claude Design

1. Go to https://claude.ai/design.
2. Start a new design session and paste the [Claude Design handoff bundle](#handoff-bundle-paste-this-into-claude-design) below (also saved at `bsure-mobile/docs/design-system/claude-design-handoff.md` for reference).
3. Upload the source Figma export PDF: `BSURE - APP - Client Wireframes 1.pdf` (in the workspace root). Vector source — much more accurate than raster screenshots.
4. Upload the current `tokens.json` so Claude Design has the design vocabulary.
5. Ask Claude Design to:
   - Calibrate the token hex values to the wireframes (output a refined `tokens.json`).
   - Produce a Figma library file with components that mirror `bsure-ui` 1:1.
   - Produce full-screen mockups for every primary screen in `spec.md § 4.*` Personas.

## Token-update workflow (when Claude Design refines a value)

1. Claude Design produces an updated `tokens.json` (with refined hex values, new spacing, etc.).
2. You diff it against the current file: `diff bsure-mobile/tokens.json <claude-design-output>`.
3. Open a PR in `bsure-mobile`:
   - Single commit, `chore(tokens): calibrate from Claude Design v<n>`.
   - Bump `_meta.version` in tokens.json.
   - In the PR description, screenshot before/after for any component visibly affected.
4. Run `pnpm storybook` locally; visually verify nothing broke.
5. Merge.

The next CI build picks up the new tokens. No code changes needed in components — they read from theme.

## Handoff bundle (paste this into Claude Design)

> ## Project: B-Sure mobile app — design system calibration
>
> **Goal:** refine our v0.1 inferred design tokens from the source Figma export, and produce a Figma library + full-screen mockups for the primary screens.
>
> **Brand:**
> - Wordmark: **B·SURE** (capital, with a green dot between the B and S; the U in SURE is replaced by a stylized horse boot icon containing four temperature-coded colored segments).
> - Default mode: **dark**, deep teal-black background. Light mode also required.
> - Brand colors are **temperature semantic**: `normal` (mint green), `med` (amber), `high` (coral red). Used on heat-map cells, status pills, gauges.
> - Primary CTA style: pill-radius (9999), mint-green fill, semibold label.
>
> **Inviolable visual rules:**
> - Color is never the sole indicator of meaning — pair with shape/icon (WCAG 1.4.1).
> - Min hit target 44×44 pt.
> - Contrast must meet WCAG 2.2 AA for all foreground/background pairs.
> - Non-diagnostic copy — no medical claims anywhere (e.g., "Elevated heat detected" not "Tendinitis detected").
>
> **Glossary (don't say these):**
> - "Athlete" → "Horse"
> - "Device" → "Boot" or "Smart Boot"
> - "Measurement" → "Scan"
> - "Symptom" / "Diagnosis" → "Pattern" / "Observation"
>
> **Personas to design for:**
> 1. Sarah — Owner-rider (1–2 horses, suburban, mid-40s).
> 2. Marcus — Professional trainer (25–30 horses, traveling).
> 3. Diana — Barn / stable manager (60-horse facility).
> 4. Dr. Patel — Vet (read-only invitee, secondary persona).
>
> **Primary screens to mock (full-screen, both light + dark):**
> - Welcome / Sign-in (Apple, Google, Email)
> - Sign-up profile completion
> - Plan selection (Regular / Trainer / User tiers)
> - Onboarding cards (Smart Boot connect, Stable health, Invite Team)
> - Bluetooth permission prompt
> - Home: 8 Horse Profiles dashboard with grid + list view, Hot Horses pill
> - Horse profile (Buttercup): tabs Activity / Basic Info / Manage Data
> - Activity tab: 184-sensor dual gauges, Last Reading metadata, Filters modal
> - Heat-map detail: Model / Heat map / Notes tabs
> - 3D leg model with sensor markers + temperature values
> - Heat-map 2D grid (8 cols × 23 rows per leg, side-by-side)
> - Calendar view (day/week/month/year drill-down)
> - Add/edit horse form (Basic / Personnel / Images tabs)
> - Connected Boots list with battery + firmware
> - Account / Settings menu (Theme picker, Units, Languages, Privacy, Learning Center)
> - Alerts feed
>
> **Tokens (current, calibrate these):**
>
> [paste tokens.json content]
>
> **Outputs needed:**
> 1. Refined `tokens.json` with calibrated values.
> 2. Figma library (Components page) mirroring our `bsure-ui` set 1:1.
> 3. Screens page with the primary screens above, both themes.
> 4. Lint report: any token that doesn't meet WCAG AA contrast against its likely background pair.

## Anti-patterns

- **Hard-coding values in Figma** that aren't in `tokens.json`. Every Figma color/style must map to a token.
- **Forgetting to update `_meta.version`** when calibrating. Future debugging needs the version stamp.
- **Designing screens that violate the constitution.** "Always" follow non-diagnostic copy, append-only history, etc. (see `bsure-infra/specs/constitution.md`).

## When Claude Design and code disagree

Constitution > Spec > Plan > Tokens > Figma > Code.

If a Figma design uses a value not in `tokens.json`, the design must change — never the code. The token system is the boundary.
