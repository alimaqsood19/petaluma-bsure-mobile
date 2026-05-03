# Fonts

## Inter

The wireframes' sans-serif rendered identically to Inter at every weight tested. We load it from Google Fonts:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

Weights used:
- **400** Regular — body copy
- **500** Medium — labels, list metadata
- **600** Semibold — buttons, headings 4/5/6, pill labels
- **700** Bold — headings 1/2/3

OpenType features turned on globally:
- `tnum` — tabular numerals (every readout in the app: temperature, sensor count, %, dates)
- `cv11` — alternate single-storey `a` (Inter's calibrated for screen)

### Substitution flag

⚠️ **Inter is a stand-in.** No Figma file or codebase was attached, so we couldn't confirm the production font. Inter is the closest match to the PDF wireframe rendering and is the conventional default for this aesthetic. **If the brand uses something else, drop the .woff2 files into this folder and update `colors_and_type.css`.**

### Files

We don't ship .woff2 files in this folder — Inter is loaded from Google Fonts CDN. If a self-hosted setup is required, download from [rsms.me/inter](https://rsms.me/inter/) (the canonical source) and place `Inter-Regular.woff2`, `Inter-Medium.woff2`, `Inter-Semibold.woff2`, `Inter-Bold.woff2` here, then swap the `@import` for an `@font-face` block.
