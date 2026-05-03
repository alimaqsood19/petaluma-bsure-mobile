# B·SURE Design System

A design system for the **B·SURE** mobile app — a smart-boot-driven equine health monitoring platform for owners, trainers, barn managers, and vets.

---

## What is B·SURE?

B·SURE is an iOS/Android app paired with the **Smart Boot**, a wearable with **184 sensors** that wraps around a horse's leg. The boot streams temperature data; the app classifies readings into three temperature bands (**normal / med / high**) and surfaces patterns at the leg, region, and stable level.

The brand wordmark is **B·SURE** — capital letters with a small green dot between the **B** and **S**, and the **U** in *SURE* replaced by a stylized horse-boot icon split into four temperature-coded colored segments.

### Who uses it
| Persona | Tier | Scope |
|---|---|---|
| **Sarah** — owner/rider, 1–2 horses, mid-40s | Regular | Single barn |
| **Marcus** — pro trainer, 25–30 horses, traveling | Trainer | Multi-barn |
| **Diana** — barn/stable manager, 60-horse facility | Trainer | Single large barn |
| **Dr. Patel** — equine vet, read-only invitee | None | Per-invite |

### Vocabulary (use exactly)
| Use | Don't say |
|---|---|
| Horse | Athlete |
| Boot / Smart Boot | Device |
| Scan | Measurement |
| Pattern / Observation / Elevated reading | Symptom / Diagnosis / Injury detected |
| Barn / Organization | Account (when scoping data) |

### Inviolable rules
- Color is **never** the only carrier of meaning. Every temperature cue is paired with a shape, icon, or label (WCAG 1.4.1).
- Min hit target **44 × 44 pt**.
- All foreground/background pairs meet **WCAG 2.2 AA** contrast.
- **Non-diagnostic copy.** "Elevated heat detected in front left region." Never "tendinitis suspected."
- Default theme is **dark**. Light mode is mandatory.

---

## Sources we worked from

- **`uploads/BSURE - APP - Client Wireframes 1.pdf`** — single-page client wireframe board, ~120 frames covering auth, onboarding, home, horse profile, scan capture, scan detail (model / heat map / notes), calendar, alerts, devices, account, theme picker. Both light and dark variants.
- **`uploads/tokens.json`** — v0.1 design tokens, inferred from raster renders of the PDF. Calibrated here to v0.2.
- Spec referenced: `bsure-infra/specs/adr/0017-design-system-phase-1.md` (project repo — not directly accessible in this environment).
- Runtime framework: **Tamagui** (per ADR 0022). `pressStyle`, `hover`, `focus`, animated transitions.

> ⚠️ **No Figma file or codebase was attached.** All values here are calibrated against the PDF wireframes and the v0.1 token JSON. Bump to v0.3 once the real Figma file lands.

---

## Index

| File / folder | What's in it |
|---|---|
| **`README.md`** | This file. Start here. |
| **`SKILL.md`** | Cross-compatible Agent Skill manifest — lets Claude Code use this system. |
| **`tokens.json`** | Calibrated design tokens (v0.2.0). Source of truth. |
| **`colors_and_type.css`** | CSS custom properties for both light + dark themes, plus typography classes. Drop-in for any HTML mockup. |
| **`assets/`** | Logos, wordmark, boot icon, illustrations. |
| **`fonts/`** | Webfont references (Inter via Google Fonts). |
| **`preview/`** | Preview cards for the Design System tab — colors, type, spacing, components. |
| **`ui_kits/mobile-app/`** | iPhone-frame mobile app UI kit — JSX components + click-through `index.html`. |
| **`research/`** | Notes extracted from the PDF (text dump, frame inventory). |

---

## Content fundamentals

**Voice: warm, professional, never clinical.** The app helps owners and trainers care for their horses — copy reads like a trusted barn manager, not a medical device. Plain English, second person, action-oriented.

- **Pronouns:** *you* and *your horse*. Never "the user," "the subject."
- **Casing:** Title Case for navigation, screen titles, and button labels ("Start Reading", "Connect a Smart Boot", "Save Profile"). Sentence case for body copy and inline helper text.
- **Punctuation:** the **middle dot** in B·SURE is a brand mark, not a period. Use `·` (U+00B7), not `•` or `.`. The wordmark always renders as `B·SURE`.
- **Numerals:** digits for measurements ("184 sensors", "8 Horse Profiles", "43 min Activity"). Spell out under ten in prose.
- **Temperature:** display the unit (°F by default, user-selectable). Always paired with a band label.
- **Labels first, values second:**
  - `Activity` / `Trotting`
  - `Date` / `May 11 2024`
  - `Reading` / `Hot`
- **No medical claims, ever.** "Elevated heat detected in front left region" — never "Tendinitis suspected" or "Injury likely."
- **Empty / WIP states** are honest: the wireframes say `WIP` for unfinished tabs. Production copy reads "Coming soon" or "We're still building this."
- **No emoji.** The brand voice is grown-up and equestrian; emoji feel out of place. Use icons or temperature pills instead.
- **Microcopy rhythm:** short imperative buttons ("Skip", "Next", "Select", "Apply Filters"), descriptive section headers ("Last 7 Readings", "Hot Readings", "Connected Boots"), value-first metadata rows ("Normal: 7", "Heat Alerts: 1").

### Sample copy
- Welcome: *"Monitor your horse's performance with tracking. Please sign in to continue."*
- Onboarding: *"The Smart Boot's 184 sensors provide real-time data to detect heat, stress, and health issues. Readings are categorized highlighting areas of concern."*
- Home subtitle: *"8 Horse Profiles · Normal: 7 · Heat Alerts: 1"*
- Permission prompt: *"'B·Sure' would like to use Bluetooth for new connections. You can allow new connections in Settings."*
- Skip-warning: *"Skipping this reading will result in less accurate data. For the best results and precise monitoring of the horse, we recommend completing all readings."*

---

## Visual foundations

### Color
**Two themes, dark is default.** The brand sits on a **deep teal-black** (`#0A1816`) — not pure black, not blue-black. The teal undertone runs through every neutral.

- **Brand primary:** mint green (`#00C896`). Slightly brighter mint (`#00DDA8`) when on dark surfaces. Always paired with `onPrimary` text.
- **Temperature semantic palette** drives every health visualization. Pair with shape:
  - **Normal** — `#2BB673` mint-green, often paired with a check or filled dot
  - **Med** — `#F2A93B` amber, paired with a half-fill or warning glyph
  - **High** — `#E85D5D` coral red, paired with a flame or alert glyph
- **Neutrals are cool-leaning** — every gray has a green-teal undertone. Never use a true neutral gray; it clashes.
- **Feedback colors** for forms & toasts are separate from temperature, but reuse the same hue families to keep the palette tight: `success #2BB673`, `warning #F2A93B`, `danger #E85D5D`, `info #3B82F6`.

### Typography
- **Inter** — the wireframe sans-serif rendered identically to Inter at all weights tested. Loaded via Google Fonts. **If the source Figma uses something else, swap here and bump version.** ⚠️ *This is a substitution flag — please confirm or send the brand font.*
- Display headings use Inter at **600/700** with `letter-spacing: -0.01em`.
- Body copy is Inter **400/500** at 16 px base, line-height 1.5.
- Button labels, pills, and small caps use **600** with `letter-spacing: 0.05em`.
- Numerals: tabular-nums via OpenType feature — every readout (temperature, % complete, sensor count) uses tabular figures so columns don't jitter.

### Spacing
8-point base. Tokens: 0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96. Never literal pixel values.

### Radii
- `sm 4` — input chips, tight metadata pills
- `md 8` — small cards, list rows
- `lg 12` — standard cards, modal sheets
- `xl 16` — large feature cards, image containers
- `2xl 24` — hero cards, the dashboard tile
- `pill 9999` — every primary CTA, every status pill, the boot icon segments

### Shadows
iOS-style elevation, neutral.950 at low alpha. Five steps (`sm` → `xl`). On dark surfaces shadows are subtle; the elevation cue is mostly **surface lift** (a slightly lighter card on a darker background).

### Cards
- Filled: `surface.card` background, `radius.lg`, no border in dark mode (rely on lift); `1px border.border` in light mode.
- Outlined: transparent background, `1px borderStrong`.
- Pressable variant: `pressStyle` shrinks scale to 0.98 with 150ms ease-out.

### Borders
- Hairline `1px` only. We don't use thick borders — separation is by radius, surface, and shadow.
- Dividers between list rows: `1px border` at low contrast, full bleed.

### Backgrounds
- **No gradients.** No image overlays. Flat surface tokens only.
- Onboarding cards have a single full-bleed photographic illustration (placeholder for now).
- The wordmark may sit on a full-bleed dark hero on auth screens.

### Animation
- Durations: `fast 150ms`, `base 250ms`, `slow 400ms`.
- Easings: `easeOut` for enters, `easeIn` for exits, `easeInOut` for transforms, `easeBack` (subtle overshoot) for success states only.
- Press: 150ms scale to 0.98.
- Sheet open: 250ms `easeOut`, slide-up from bottom.
- No bouncy spring chrome. Subtle, professional.

### Hover / focus / press states
Mobile-first, but Tamagui exposes hover for the web target:
- **Hover** (web): brand button → `primaryHover #00B084`. Card → 1-step shadow lift.
- **Focus**: 2px outline using `brand.primary` with 2px offset. Always visible — never `outline: none`.
- **Press**: `primaryActive #009972`. Scale 0.98. Haptic on native.
- **Disabled**: 40% opacity, no shadow, `cursor: not-allowed`.

### Transparency & blur
- Modal backdrop: `neutral.950 @ 45%` light, `black @ 65%` dark. No backdrop-filter blur — keeps it readable on low-end Android.
- Bottom sheets are **opaque** with a top-radius `radius.xl`.

### Imagery
- Photography is warm, golden-hour, equestrian. Horses in barns, riders mid-trot, hands adjusting tack. Never sterile vet-clinic photography.
- B&W is acceptable for empty/secondary states.
- No grain, no heavy filters.

### Layout rules
- **Fixed elements:** status bar (top), header (sticky), bottom nav (4 tabs: Home / Quick Read / Alerts / Account). Bottom nav is **always** visible on top-level screens.
- **Safe areas** respected on iOS — bottom nav lifts above home-indicator.
- Content max-width on tablet/web: 480 px. The app is mobile-first and never spans wider on a phone.
- 16 px horizontal padding throughout content. 24 px top section gaps.

---

## Iconography

See `assets/ICONOGRAPHY.md` for the full guide.

**Short version:** B·SURE uses **Lucide** as its icon system — outlined, 1.5 stroke, 24 px default. Brand-specific marks (the boot wordmark icon, the temperature segment glyph) live as inline SVGs in `assets/`. No emoji, ever.

---

## UI kits

| Kit | Path | Purpose |
|---|---|---|
| **Mobile app** | `ui_kits/mobile-app/` | iPhone-frame click-through — primary screens, both themes. |

---

## Caveats & open questions

1. **Font is Inter as a stand-in.** Confirm or replace with the actual brand font.
2. **No Figma source attached.** Calibration is from the PDF + token spec only. Bump to v0.3 once Figma lands.
3. **No real photography.** Onboarding screens use placeholder colored panels.
4. **Boot icon mark is reconstructed** from the wordmark description (4 temperature-coded segments). Replace with the official SVG when available.
