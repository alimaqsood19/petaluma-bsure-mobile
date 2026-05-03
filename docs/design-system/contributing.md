# Contributing to the design system

How to add a component, change a token, or evolve the system without breaking the contract.

## Add a new component

1. Identify the spec / task ID (e.g., T2.12 HeatMapGrid).
2. Create `bsure-mobile/src/ui/<Name>.tsx`. Build it with Tamagui's `styled()` API.
3. Use only token references (`$primary`, `$space.4`, etc.). Never hard-code values.
4. Export from `src/ui/index.ts`.
5. Create `<Name>.stories.tsx` with at least: default story, all variants, an accessibility-edge story (e.g., long text, error state).
6. Add a row to [`components.md`](./components.md) with usage example.
7. Verify in Storybook + axe-core (a11y addon). No critical violations.
8. PR title: `T<id>: bsure-ui — add <Name>`. Reference the spec.

## Change a token value

The contract is sacred. If you change a token, both code and Claude Design pick it up.

1. Edit `tokens.json`. Keep the `_doc` annotation up to date.
2. Bump `_meta.version` (semver: patch for tweaks, minor for additions, major for renames).
3. Run `pnpm storybook` — visually verify nothing important broke. Pay attention to:
   - Color contrast (a11y addon).
   - Spacing collapses or overflows.
4. Update `docs/design-system/tokens.md` if the new value's intent differs from the prior one.
5. PR title: `chore(tokens): <what changed and why>`.

## Add a new token

When the existing scale doesn't accommodate a need.

1. Add to `tokens.json` in the appropriate group.
2. Add to `tokens-loader.ts` if it's a new group altogether.
3. Add to `tamagui.config.ts` (probably as a new theme key or `$<name>`).
4. Document in `tokens.md`.
5. Verify a Claude Design refresh doesn't conflict.

Resist the urge to add tokens. The current scale was chosen to minimize choices. If a screen needs a value not on the scale, it's usually a sign the screen should adapt to the scale, not the other way around.

## Rename a token

Should be rare. If you must:

1. Add the new token alongside the old.
2. Migrate all consumers in a single PR.
3. Remove the old token in a follow-up PR.
4. Bump the major version.

## Promote a screen-level component to `bsure-ui`

When you've built a component three times in `app/` for different screens, promote it.

1. Move from `app/.../components/` to `src/ui/`.
2. Generalize props (replace screen-specific names).
3. Add Storybook stories.
4. Update calling sites to import from `'src/ui'`.
5. Add a row to `components.md`.

## When to NOT use the design system

The design system is for **shared visual primitives**, not screen-specific compositions. The line:

| Lives in `src/ui/` | Lives in `app/<feature>/components/` |
|---|---|
| Button | OnboardingHeroButton |
| Card | HorseCard (composes Card + Pill + Text) |
| Pill | HotHorsesIndicator (composes Pill + count badge) |
| Input | ScanContextForm (composes 5 Inputs + Toggle + Submit) |

Promote when reuse becomes evident (rule of three).

## Constitution checklist for any DS change

- [ ] No hard-coded values.
- [ ] Color is never the sole indicator (constitution N5.3).
- [ ] Hit targets ≥ 44×44 pt (N5.4).
- [ ] WCAG AA contrast for foreground/background pairs (N5.1, N5.3).
- [ ] Component has accessibility role + state.
- [ ] Component reads tokens via Tamagui theme, not direct `tokens.json` import (loader does that once).
- [ ] No medical claims in copy or comments (P2 — non-diagnostic).
- [ ] Vocabulary matches glossary (no "Athlete", "Device" for boot, "Symptom", etc.).

## Reference

- ADR 0017 — Comprehensive design system in Phase 1.
- ADR 0022 — Tamagui supersedes NativeWind.
- Constitution principles N5.* (accessibility), P2 (non-diagnostic), N5.3 (color + meaning).
