# Accessibility — WCAG 2.2 AA notes

Per constitution N5.* and ADR 0017, the design system targets **WCAG 2.2 AA** for all primary screens by GA. Phase 1 ships AA for primary flows.

## Color contrast (computed against tokens v0.1)

> ⚠ Inferred values; recomputed on every `tokens.json` calibration. CI lint enforces this on PRs.

| Foreground | Background | Ratio | WCAG AA pass? |
|---|---|---|---|
| `$color` (light) `#11201D` | `$background` (light) `#FFFFFF` | 16.5 : 1 | ✓✓ AAA |
| `$color` (dark) `#FFFFFF` | `$background` (dark) `#0A1816` | 18.2 : 1 | ✓✓ AAA |
| `$colorSecondary` (light) `#3F4D49` | `$background` (light) `#FFFFFF` | 8.7 : 1 | ✓✓ AAA |
| `$colorSecondary` (dark) `#D8DFDC` | `$background` (dark) `#0A1816` | 13.1 : 1 | ✓✓ AAA |
| `$colorMuted` `#8A9893` | `$background` (light) `#FFFFFF` | 3.1 : 1 | ✓ AA (Large only) |
| `$colorMuted` `#8A9893` | `$background` (dark) `#0A1816` | 4.6 : 1 | ✓ AA |
| `$colorOnPrimary` (light) `#FFFFFF` | `$primary` (light) `#00C896` | 2.1 : 1 | ✗ Fails — see fix below |
| `$colorOnPrimary` (dark) `#0A1816` | `$primary` (dark) `#00DDA8` | 11.8 : 1 | ✓✓ AAA |
| `$tempNormal` text on dark | `$background` (dark) | 4.0 : 1 | ✓ AA |
| `$tempMed` text | `$background` (dark) | 7.4 : 1 | ✓ AAA |
| `$tempHigh` text | `$background` (dark) | 5.1 : 1 | ✓ AA |

### Known issues to address before GA

1. **Light-theme primary CTA** (`$colorOnPrimary` white on `$primary` mint): contrast 2.1 : 1, fails AA.
   - Fix options: darken `$primary` (light) to `#008868` (4.5+ : 1 with white), or change `$colorOnPrimary` to `$neutral900`.
   - Recommendation: change `$colorOnPrimary` (light) to `$neutral900` `#11201D` — dark text on mint reads as a "premium" CTA in barn settings (better outdoor sunlight legibility).
   - Tracked in T2.11 design-system polish.

## Keyboard / focus / VoiceOver guidelines

| Component | A11y notes |
|---|---|
| `Button` | `accessibilityRole="button"`, `accessibilityState` for disabled/busy. Native press feedback via `pressStyle`. |
| `Input` | `accessibilityLabel` set from `label` prop. Error messages exposed via `accessibilityHint`. |
| `Tabs` | `accessibilityRole="tablist"` on container, `accessibilityRole="tab"` + `selected` state on items. |
| `Toggle` | `accessibilityRole="switch"`, `accessibilityState.checked` for state. |
| `Modal` / `BottomSheet` | Backdrop dismiss + focus trap (Tamagui Sheet handles). Title has `accessibilityRole="header"`. |
| `BottomNav` | `accessibilityRole="tablist"`. Each tab labeled, selected state announced. Badges read by screen reader. |
| `Header` | Back button has `accessibilityLabel="Go back"`. Title is plain text (screen readers pick up). |

## Hit targets

Min size 44×44 pt enforced via:
- Components have explicit `height ≥ 44` (`Button` md = 48, sm = 40 + `hitSlop`).
- `Pressable` components include `hitSlop` where the visual size is smaller than 44 (e.g., back chevron, toggle).

## Color is never the only carrier of meaning

Constitution N5.3 and WCAG 1.4.1. The temperature palette (`normal`/`med`/`high`) is always paired with:
- A label ("Normal", "Med", "High").
- A shape or icon (e.g., heat-map cells use position + saturation; gauge uses arc geometry).
- A numeric reading where applicable.

Never display only a colored dot to convey state. Lint rule (T2.11) flags any `Pill`, `Card`, or `Heat*` component that renders a single color band without a label or icon.

## Motion preferences

`@react-native-community/hooks`' `useReduceMotion` (Phase 2) gates all decorative animations. Tamagui's `animation="..."` prop falls back to instant when reduce-motion is set. No essential information is conveyed by motion alone.

## Testing checklist (per primary screen — T3.11)

- [ ] VoiceOver (iOS) reads every interactive element with intent.
- [ ] TalkBack (Android) likewise.
- [ ] Keyboard navigation reaches every interactive element (web Storybook + RN-Web).
- [ ] Focus order is logical (top-to-bottom, primary-action-last).
- [ ] All color-coded states have a non-color indicator.
- [ ] All text passes contrast.
- [ ] All hit targets ≥ 44×44 pt.
- [ ] Reduce-motion preference respected.

Tracked in T3.11 (Accessibility AA pass) before GA.
