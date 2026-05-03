# Claude Design handoff bundle (paste into claude.ai/design)

> Copy from "BEGIN PASTE" to "END PASTE" into a new Claude Design session. Then upload `BSURE - APP - Client Wireframes 1.pdf` (workspace root) and `bsure-mobile/tokens.json`.

---

# BEGIN PASTE

## Project: B-Sure mobile app — design system calibration & screen mocks

**Goal.** Calibrate inferred v0.1 design tokens to the actual values in our wireframes Figma export, then produce a Figma library + full-screen mockups for every primary screen, both light and dark.

## Brand

- Wordmark: **B·SURE** (capital, with a green dot between the B and S; the U in SURE is replaced by a stylized horse boot icon containing four temperature-coded colored segments).
- Default mode: **dark**, deep teal-black background. Light mode also required.
- Brand colors are **temperature semantic**: `normal` (mint green), `med` (amber), `high` (coral red). Used on heat-map cells, status pills, gauges, leg-model markers.
- Primary CTA style: pill-radius (9999), mint-green fill, semibold label.
- Default font: Inter. Calibrate to actual font in the source if different.

## Inviolable visual rules

- Color is never the sole indicator of meaning — pair every color cue with a shape, icon, or label (WCAG 1.4.1).
- Min hit target 44×44 pt for any interactive element.
- Contrast must meet WCAG 2.2 AA for all foreground/background pairs.
- Non-diagnostic copy — no medical claims anywhere. Use "Elevated heat detected in front left region", never "Tendinitis suspected" or similar.

## Vocabulary (must use exactly)

| Use | Don't say |
|---|---|
| Horse | Athlete |
| Boot or Smart Boot | Device |
| Scan | Measurement |
| Pattern / Observation / Elevated reading | Symptom / Diagnosis / Injury detected |
| Barn or Organization | Account (when meaning data scope) |

## Personas to design for

1. **Sarah** — Owner-rider, 1–2 horses, suburban, mid-40s. Subscribes to Regular tier.
2. **Marcus** — Professional trainer, 25–30 horses across 2 barns, traveling. Trainer tier.
3. **Diana** — Barn / stable manager, 60-horse facility. Trainer tier.
4. **Dr. Patel** — Equine vet, secondary persona, read-only invitee. No subscription.

## Primary screens to mock (full-screen, both light + dark, iPhone 14 Pro size)

**Auth & onboarding**
- Welcome / Sign-in (Apple, Google, Email)
- Email sign-up
- Bluetooth permission OS prompt
- Profile completion form (First & Last Name, Role, Stable Name, Discipline)
- Onboarding cards (Smart Boot connect, Stable health, Invite Team)
- Plan selection (Regular / Trainer / User tiers, three cards with feature checklist + Select)

**Home & horse**
- Home: 8 Horse Profiles dashboard with grid + list view, "Hot Readings" toggle, search + add
- Horse profile (e.g., Buttercup): tabs Activity / Basic Info / Manage Data
- Activity tab: 184-sensor dual gauges, Last Reading metadata, More Details, Filters button, Start Reading CTA
- Filters bottom-sheet: Activity dropdown, Readings window dropdown (Last 7 / 14 / 30), leg radio
- Last 7 Readings: stacked bar visualization showing %normal/%med/%high per day
- Add/edit horse form: tabs Basic / Personnel / Images, "Profile 80% complete" footer + Save Profile

**Scan capture & detail**
- Scan capture flow (5 steps: pick horse → start scan → capture → activity context → save)
- Scan detail — Model tab (3D leg with sensor markers + temp values, Calendar button, Rotate)
- Scan detail — Heat map tab (2D grid 8×23 cells per leg, Front Left / Front Right side-by-side)
- Scan detail — Notes tab (free-text + pinned region annotations)

**Calendar & alerts**
- Calendar view (day / week / month / year drill-down) with deviation indicators
- Alerts feed (newest-first, with horse + leg + region, Acknowledge button)

**Devices & account**
- Connected Boots list (3 boots: Barn Boot - 1/2/3 with model, serial, firmware, battery, paired status, gear icon)
- Account / Settings menu (Profile / Notifications / Admin Controls / Themes / Languages / Units / Privacy / Learning Center / Tool Tips)
- Theme picker (OS / Light / Dark)

**Phase 3 (lower priority for first pass)**
- Quick Read flow (capture without horse selection)
- Member management (invite, role change, remove)
- Subscription state (trial banner, lapsed paywall)

## Components to mirror in the Figma library (Components page)

The Figma library should include components 1:1 with our `bsure-ui` set:

- Button (variants: primary, secondary, ghost, danger; sizes: sm, md, lg; states: default, loading, disabled)
- Pill (intents: normal, med, high, brand, neutral, info; sizes: sm, md; outline variants)
- Input (default, focus, error, disabled; with label, helper text, error message)
- Card (filled, outlined, flat; padding none/sm/md/lg; pressable variant)
- Heading (levels 1–6)
- Body (sizes sm/base/md/lg; intents primary/secondary/muted/brand/danger; weights regular/medium/semibold/bold)
- Label, Caption
- Modal, BottomSheet (with title, dismissible, snap points)
- Tabs (horizontal underline)
- Header (back chevron + title + right action slot)
- BottomNav (4 tabs with icons + label + optional badge)
- Toggle (with optional label, left/right position)

Plus Phase 2 components (mock visuals, code comes later):
- Gauge (dual arc, 184 sensors, normal/med/high segments)
- HeatMapCell + HeatMapGrid
- LegPicker (FL/FR/BL/BR radio cluster)
- LegModel3D placeholder
- StackedBar (last-N readings)
- AlertCard
- BootCard

## Tokens (current v0.1 — calibrate these)

{
  "$schema": "./tokens.schema.json",
  "_meta": {
    "name": "B-Sure Design Tokens",
    "version": "0.1.0",
    "updated": "2026-05-01",
    "notes": "Token values inferred from raster renders of BSURE - APP - Client Wireframes 1.pdf. Hex values are within ±5% of the visual target. Calibrate from the source Figma file (or via Claude Design at claude.ai/design) once available, then bump version. The ai-design-integration.md doc explains the round-trip."
  },

  "color": {
    "_doc": "All colors expressed as hex. Semantic colors (normal/med/high) drive temperature visualization across the app. Surface tokens differ between light and dark modes; reference them via the theme rather than directly.",

    "brand": {
      "primary":   { "value": "#00C896", "_doc": "Mint green — primary CTA pills and accents. Pairs with surface.dark for the default dark theme." },
      "primaryHover":   { "value": "#00B084" },
      "primaryActive":  { "value": "#009972" },
      "primaryOnDark":  { "value": "#00DDA8", "_doc": "Slightly brighter mint for use against dark surfaces (WCAG AA contrast on surface.dark = 4.7)." }
    },

    "temperature": {
      "_doc": "The temperature classification palette. ALWAYS pair with shape/icon — color is never the only carrier of meaning (constitution N5.3).",
      "normal": { "value": "#2BB673", "_doc": "Healthy / baseline — green." },
      "med":    { "value": "#F2A93B", "_doc": "Watch / elevated — amber." },
      "high":   { "value": "#E85D5D", "_doc": "Alert / hot — coral red." }
    },

    "neutral": {
      "_doc": "Neutral grays for text, dividers, and backgrounds. Cool-leaning to match brand teal undertone.",
      "0":   { "value": "#FFFFFF" },
      "50":  { "value": "#F7F9F8" },
      "100": { "value": "#EEF2F0" },
      "200": { "value": "#D8DFDC" },
      "300": { "value": "#B8C2BE" },
      "400": { "value": "#8A9893" },
      "500": { "value": "#5E6E69" },
      "600": { "value": "#3F4D49" },
      "700": { "value": "#2A3633" },
      "800": { "value": "#1A2421" },
      "900": { "value": "#11201D" },
      "950": { "value": "#0A1816" }
    },

    "surface": {
      "_doc": "Reference these via theme.background.* etc. — not directly. Light + dark themes resolve to different neutrals.",
      "light": {
        "background":    { "value": "#FFFFFF" },
        "backgroundAlt": { "value": "#F7F9F8" },
        "card":          { "value": "#FFFFFF" },
        "border":        { "value": "#EEF2F0" },
        "borderStrong":  { "value": "#D8DFDC" },
        "overlay":       { "value": "rgba(10, 24, 22, 0.45)", "_doc": "Modal backdrop — neutral.950 @ 45%." }
      },
      "dark": {
        "background":    { "value": "#0A1816", "_doc": "Default app background. Deep teal-black from wireframes." },
        "backgroundAlt": { "value": "#11201D" },
        "card":          { "value": "#1A2421" },
        "border":        { "value": "#2A3633" },
        "borderStrong":  { "value": "#3F4D49" },
        "overlay":       { "value": "rgba(0, 0, 0, 0.65)" }
      }
    },

    "text": {
      "_doc": "Reference via theme.text.* — light/dark themes resolve to different values.",
      "light": {
        "primary":   { "value": "#11201D" },
        "secondary": { "value": "#3F4D49" },
        "muted":     { "value": "#8A9893" },
        "inverse":   { "value": "#FFFFFF" },
        "onPrimary": { "value": "#FFFFFF", "_doc": "Text on the brand.primary mint pill." }
      },
      "dark": {
        "primary":   { "value": "#FFFFFF" },
        "secondary": { "value": "#D8DFDC" },
        "muted":     { "value": "#8A9893" },
        "inverse":   { "value": "#11201D" },
        "onPrimary": { "value": "#0A1816", "_doc": "Dark text on the bright mint pill — high contrast." }
      }
    },

    "feedback": {
      "_doc": "Generic semantic colors for non-temperature feedback (form validation, toasts, etc.).",
      "success": { "value": "#2BB673" },
      "warning": { "value": "#F2A93B" },
      "danger":  { "value": "#E85D5D" },
      "info":    { "value": "#3B82F6" }
    }
  },

  "typography": {
    "_doc": "Font: Inter as default (close match to wireframe sans-serif). Calibrate to actual brand font once Figma source is available.",
    "fontFamily": {
      "sans":    { "value": "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
      "display": { "value": "Inter, system-ui, sans-serif", "_doc": "Used for headings; same family for v1 with heavier weights." },
      "mono":    { "value": "ui-monospace, 'SF Mono', Menlo, monospace" }
    },
    "fontSize": {
      "xs":   { "value": 12 },
      "sm":   { "value": 14 },
      "base": { "value": 16 },
      "md":   { "value": 18 },
      "lg":   { "value": 20 },
      "xl":   { "value": 24 },
      "2xl":  { "value": 32 },
      "3xl":  { "value": 40 },
      "4xl":  { "value": 56 }
    },
    "fontWeight": {
      "regular":  { "value": "400" },
      "medium":   { "value": "500" },
      "semibold": { "value": "600" },
      "bold":     { "value": "700" }
    },
    "lineHeight": {
      "tight":   { "value": 1.15 },
      "snug":    { "value": 1.3 },
      "normal":  { "value": 1.5 },
      "relaxed": { "value": 1.7 }
    },
    "letterSpacing": {
      "tight":  { "value": "-0.01em" },
      "normal": { "value": "0" },
      "wide":   { "value": "0.05em", "_doc": "Used on small caps / button labels." }
    }
  },

  "space": {
    "_doc": "8-point base scale. Use through theme; never literal pixel values.",
    "0":    { "value": 0 },
    "0.5":  { "value": 2 },
    "1":    { "value": 4 },
    "2":    { "value": 8 },
    "3":    { "value": 12 },
    "4":    { "value": 16 },
    "5":    { "value": 20 },
    "6":    { "value": 24 },
    "8":    { "value": 32 },
    "10":   { "value": 40 },
    "12":   { "value": 48 },
    "16":   { "value": 64 },
    "24":   { "value": 96 }
  },

  "radius": {
    "none":  { "value": 0 },
    "sm":    { "value": 4 },
    "md":    { "value": 8 },
    "lg":    { "value": 12 },
    "xl":    { "value": 16 },
    "2xl":   { "value": 24 },
    "pill":  { "value": 9999, "_doc": "Used on the primary CTAs throughout the wireframes." },
    "round": { "value": 9999 }
  },

  "shadow": {
    "_doc": "iOS-style elevations. Use theme.shadow.* — RN renders via shadow* props, RN-Web via box-shadow.",
    "none": { "value": "none" },
    "sm":   { "value": "0 1px 2px rgba(10, 24, 22, 0.06)" },
    "md":   { "value": "0 4px 8px rgba(10, 24, 22, 0.10)" },
    "lg":   { "value": "0 8px 24px rgba(10, 24, 22, 0.14)" },
    "xl":   { "value": "0 16px 48px rgba(10, 24, 22, 0.20)" }
  },

  "motion": {
    "duration": {
      "instant": { "value": 50 },
      "fast":    { "value": 150 },
      "base":    { "value": 250 },
      "slow":    { "value": 400 },
      "slower":  { "value": 600 }
    },
    "easing": {
      "linear":      { "value": "linear" },
      "easeIn":      { "value": "cubic-bezier(0.4, 0, 1, 1)" },
      "easeOut":     { "value": "cubic-bezier(0, 0, 0.2, 1)" },
      "easeInOut":   { "value": "cubic-bezier(0.4, 0, 0.2, 1)" },
      "easeBack":    { "value": "cubic-bezier(0.34, 1.56, 0.64, 1)", "_doc": "Subtle overshoot — used on success states." }
    }
  },

  "breakpoint": {
    "_doc": "Used by Tamagui media queries. Mobile-first.",
    "sm": { "value": 640 },
    "md": { "value": 768 },
    "lg": { "value": 1024 },
    "xl": { "value": 1280 }
  },

  "zIndex": {
    "base":     { "value": 0 },
    "raised":   { "value": 10 },
    "overlay":  { "value": 100 },
    "modal":    { "value": 200 },
    "popover":  { "value": 300 },
    "toast":    { "value": 400 },
    "tooltip":  { "value": 500 }
  }
}


## Outputs needed

1. **Refined `tokens.json`** with calibrated hex values, refined typography scale if the source uses something different from Inter, refined spacing if needed. Bump `_meta.version` to 0.2.0.
2. **Figma library file** (`.fig`) with:
   - Components page mirroring our `bsure-ui` set 1:1, with variant matrix.
   - Color styles named to match token names (e.g., `Brand/Primary`, `Temperature/Normal`, `Surface/Dark/Background`).
   - Typography styles named to match (e.g., `Heading/H1`, `Body/Base/Regular`).
3. **Screens page** with the primary screens above, both themes. Use the Components page as the building blocks.
4. **Lint report**: any token that doesn't meet WCAG 2.2 AA contrast against its likely background pair, with recommendations for fixes.

## Constraints / context

- Design system spec lives in `bsure-infra/specs/adr/0017-design-system-phase-1.md` (project repo).
- Tamagui is the runtime framework (ADR 0022). Variants we use: pressStyle, hover, focus, animated transitions.
- Light + dark themes are mandatory; default is dark.
- We aim for Apple HIG + Material 3 hybrid feel — clean, professional, equestrian-warm (not sterile).

# END PASTE

---

## After Claude Design produces output

1. Save the refined `tokens.json` somewhere temporary.
2. `diff bsure-mobile/tokens.json <claude-design-output>` to review changes.
3. Open a PR in `bsure-mobile`:
   - Single commit titled `chore(tokens): calibrate from Claude Design v0.2`.
   - Bump `_meta.version` in tokens.json to 0.2.0.
   - In the PR description, include before/after screenshots for any visibly affected component.
4. Save the Figma library file at `bsure-mobile/docs/design-system/figma/bsure-ui.fig` (gitignored — link to a Figma URL in `figma-link.md` instead).
5. Run `pnpm storybook` locally; verify nothing breaks.
6. Merge.
