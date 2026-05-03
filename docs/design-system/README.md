# B-Sure Design System

> Tokens-driven, Tamagui-based component library for the B-Sure mobile app. Single source of truth at `tokens.json` — both code and visual design (Claude Design / Figma) consume the same file.

## What's in this design system

| Layer | Lives at | Purpose |
|---|---|---|
| **Tokens** | [`tokens.json`](../../tokens.json) | Canonical values: colors, typography, spacing, radii, shadows, motion, breakpoints. |
| **Tokens loader** | [`src/ui/tokens-loader.ts`](../../src/ui/tokens-loader.ts) | Strips `_doc`/`_meta`, exposes flat consumable maps. |
| **Tamagui config** | [`tamagui.config.ts`](../../tamagui.config.ts) | Wires tokens into Tamagui's `createTokens` + `createTheme` + `createTamagui`. |
| **Theme provider** | [`src/ui/ThemeProvider.tsx`](../../src/ui/ThemeProvider.tsx) | Wraps the app; resolves user preference (system/light/dark). |
| **Components** | [`src/ui/`](../../src/ui/) | 10 core components: Button, Pill, Input, Text, Card, Modal+BottomSheet, Tab, Header, BottomNav, Toggle. |
| **Storybook** | [`.storybook/`](../../.storybook/) | Visual QA + a11y addon. Run `pnpm storybook`. |
| **Docs** | this folder | Usage, accessibility, integration with Claude Design. |

## Read in this order

1. [`tokens.md`](./tokens.md) — token reference (every value, what it's for).
2. [`components.md`](./components.md) — when to use each component, props summary, anti-patterns.
3. [`accessibility.md`](./accessibility.md) — WCAG 2.2 AA notes per component, color-contrast computed values.
4. [`claude-design-integration.md`](./claude-design-integration.md) — how to keep code and Figma in sync.
5. [`contributing.md`](./contributing.md) — adding a new component, updating tokens.

## The contract

**`tokens.json` is the contract.** Both the React Native components and Claude Design consume the same file. When a designer adjusts a value (in Figma via Claude Design), they update `tokens.json`; the components inherit the change automatically.

Lint rule (T2.11): no hard-coded color, spacing, or font values may appear in `src/ui/` outside of `tokens.json` and `tamagui.config.ts`.

## Status

- **Token version:** v0.1.0 (inferred from raster wireframes; calibrate from Figma source via Claude Design — see [`claude-design-integration.md`](./claude-design-integration.md)).
- **Components:** 10 of ~15 — Phase 1 foundation. Domain components (Gauge, HeatMapCell, LegPicker) ship in Phase 2.
- **Storybook:** scaffolded, one story per component, a11y addon enabled.
- **Theming:** light + dark, default dark.

Next steps tracked under T1.36–T1.39 + T2.11 in `bsure-infra/specs/tasks.md`.
