# Iconography

## System: Lucide

B·SURE uses **[Lucide](https://lucide.dev)** — outlined, 1.5px stroke, 24px default. It pairs cleanly with Inter, has comprehensive coverage for our domain (calendar, alerts, settings, devices), and is MIT-licensed.

> ⚠️ **Substitution flag.** The codebase / Figma source wasn't attached, so we couldn't confirm the production icon set. Lucide is our best-fit substitute based on the wireframes' clean outlined glyphs. If the team uses something else (Phosphor, Tabler, custom set), swap and document here.

### Loading

```html
<!-- CDN, on-demand SVG -->
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
<i data-lucide="bell"></i>
<script>lucide.createIcons();</script>
```

### Usage rules

- Default size **24×24**. In compact rows or pills, **20×20** or **16×16**.
- Stroke weight **1.5** universally. Don't mix weights.
- Color = current text color (`stroke="currentColor"`). Tint by setting parent color, never hardcode.
- **Hit targets minimum 44×44** — pad the parent button, not the icon itself.
- **Always pair icons with a label or aria-label.** No icon-only buttons without an accessible name.

### Common icons in this app

| Use | Lucide name |
|---|---|
| Home tab | `home` |
| Quick Read tab | `radio` (or custom boot mark) |
| Alerts tab | `bell` |
| Account tab | `user-round` |
| Back / chevron | `chevron-left` |
| Filters | `sliders-horizontal` |
| Calendar | `calendar` |
| Add | `plus` |
| Search | `search` |
| Settings | `settings` |
| Bluetooth | `bluetooth` |
| Battery | `battery` / `battery-low` |
| Rotate (3D model) | `rotate-3d` |
| Temperature normal | `circle-check` |
| Temperature med | `circle-alert` |
| Temperature high | `flame` |
| Apple sign-in | `apple` |
| Google sign-in | brand SVG (separately) |

### Brand marks (custom SVG, NOT Lucide)

- `assets/wordmark.svg` — `B·SURE` wordmark with the boot replacing the U.
- `assets/boot-icon.svg` — square app-icon variant, just the boot mark on dark.

These are inline SVG with `currentColor` on the lettering and explicit hex on the temperature segments. The temperature segment colors are part of the brand mark and **never recolored**.

### What NOT to use

- ❌ **Emoji.** Never. Not in copy, not in iconography, not in empty states.
- ❌ **Unicode glyph as an icon** (★, ✓, ▲). Use the Lucide equivalent.
- ❌ **PNG icons.** SVG only — they need to scale and recolor for dark/light themes.
- ❌ **Filled icons** unless paired with an outlined sibling for consistent rhythm. The system is outlined.

### Temperature pairing rule

Per WCAG 1.4.1, color is never the only carrier of meaning. Every temperature cue uses **shape + color + label**:

- **Normal** → `circle-check` + green `#2BB673` + label "Normal"
- **Med**    → `circle-alert` + amber `#F2A93B` + label "Med"
- **High**   → `flame` + coral `#E85D5D` + label "High"
