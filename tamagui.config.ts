/**
 * tamagui.config.ts
 *
 * The Tamagui design-system configuration for B-Sure.
 *
 * Contract: this file consumes `tokens.json` (via `src/ui/tokens-loader.ts`)
 * and feeds those values into Tamagui's `createTokens` + `createTheme` +
 * `createTamagui`. To change a color, font, or spacing value, edit
 * `tokens.json` — never hard-code values here.
 *
 * Themes: `light` and `dark` (default). User-selectable via Account → Themes.
 *
 * Refs: ADR 0017 (design system in Phase 1), ADR 0022 (Tamagui supersedes
 *       NativeWind), constitution N5.3 (color is never sole indicator).
 */

import { createAnimations } from '@tamagui/animations-react-native';
import { createInterFont } from '@tamagui/font-inter';
import { createMedia } from '@tamagui/react-native-media-driver';
import { shorthands } from '@tamagui/shorthands';
import { createTamagui, createTokens } from 'tamagui';

import {
  breakpoint,
  colors,
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight,
  motion,
  radius,
  shadow,
  space,
  zIndex,
} from './src/ui/tokens-loader';

// ---------------------------------------------------------------------------
// Tokens — the single layer of "raw values" Tamagui knows about.
// All component-level styling references these via `$<token>` shorthand.
// ---------------------------------------------------------------------------

const tokens = createTokens({
  color: {
    // Brand
    primary: colors.brand.primary,
    primaryHover: colors.brand.primaryHover,
    primaryActive: colors.brand.primaryActive,
    primaryOnDark: colors.brand.primaryOnDark,

    // Temperature semantic palette
    tempNormal: colors.temperature.normal,
    tempMed: colors.temperature.med,
    tempHigh: colors.temperature.high,

    // Neutral scale
    neutral0: colors.neutral['0'],
    neutral50: colors.neutral['50'],
    neutral100: colors.neutral['100'],
    neutral200: colors.neutral['200'],
    neutral300: colors.neutral['300'],
    neutral400: colors.neutral['400'],
    neutral500: colors.neutral['500'],
    neutral600: colors.neutral['600'],
    neutral700: colors.neutral['700'],
    neutral800: colors.neutral['800'],
    neutral900: colors.neutral['900'],
    neutral950: colors.neutral['950'],

    // Generic feedback
    success: colors.feedback.success,
    warning: colors.feedback.warning,
    danger: colors.feedback.danger,
    info: colors.feedback.info,
  },

  space: {
    0: space['0'],
    '0.5': space['0.5'],
    1: space['1'],
    2: space['2'],
    3: space['3'],
    4: space['4'],
    5: space['5'],
    6: space['6'],
    8: space['8'],
    10: space['10'],
    12: space['12'],
    16: space['16'],
    24: space['24'],
    true: space['4'], // Tamagui requires `true` as the default space
  },

  size: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    24: 96,
    44: 176, // Min hit-target (44pt) reserved key — see WCAG N5.4
    true: 16,
  },

  radius: {
    none: radius.none,
    sm: radius.sm,
    md: radius.md,
    lg: radius.lg,
    xl: radius.xl,
    '2xl': radius['2xl'],
    pill: radius.pill,
    round: radius.round,
    true: radius.md,
  },

  zIndex: {
    base: zIndex.base,
    raised: zIndex.raised,
    overlay: zIndex.overlay,
    modal: zIndex.modal,
    popover: zIndex.popover,
    toast: zIndex.toast,
    tooltip: zIndex.tooltip,
  },
});

// ---------------------------------------------------------------------------
// Themes — semantic color names that resolve differently for light vs dark.
// Components reference `$background`, `$color`, `$borderColor`, etc.
// ---------------------------------------------------------------------------

const lightTheme = {
  background: colors.surface.light.background,
  backgroundAlt: colors.surface.light.backgroundAlt,
  backgroundCard: colors.surface.light.card,
  borderColor: colors.surface.light.border,
  borderColorStrong: colors.surface.light.borderStrong,
  overlay: colors.surface.light.overlay,

  color: colors.text.light.primary,
  colorSecondary: colors.text.light.secondary,
  colorMuted: colors.text.light.muted,
  colorInverse: colors.text.light.inverse,
  colorOnPrimary: colors.text.light.onPrimary,

  primary: colors.brand.primary,
  primaryHover: colors.brand.primaryHover,
  primaryActive: colors.brand.primaryActive,

  // Temperature — same in both themes (intentional; semantic).
  tempNormal: colors.temperature.normal,
  tempMed: colors.temperature.med,
  tempHigh: colors.temperature.high,

  // Shadows
  shadowSm: shadow.sm,
  shadowMd: shadow.md,
  shadowLg: shadow.lg,
  shadowXl: shadow.xl,
};

const darkTheme = {
  background: colors.surface.dark.background,
  backgroundAlt: colors.surface.dark.backgroundAlt,
  backgroundCard: colors.surface.dark.card,
  borderColor: colors.surface.dark.border,
  borderColorStrong: colors.surface.dark.borderStrong,
  overlay: colors.surface.dark.overlay,

  color: colors.text.dark.primary,
  colorSecondary: colors.text.dark.secondary,
  colorMuted: colors.text.dark.muted,
  colorInverse: colors.text.dark.inverse,
  colorOnPrimary: colors.text.dark.onPrimary,

  primary: colors.brand.primaryOnDark,
  primaryHover: colors.brand.primary,
  primaryActive: colors.brand.primaryActive,

  tempNormal: colors.temperature.normal,
  tempMed: colors.temperature.med,
  tempHigh: colors.temperature.high,

  shadowSm: shadow.sm,
  shadowMd: shadow.md,
  shadowLg: shadow.lg,
  shadowXl: shadow.xl,
};

// ---------------------------------------------------------------------------
// Fonts — Inter from @tamagui/font-inter, configured against our token sizes.
// ---------------------------------------------------------------------------

const interFont = createInterFont({
  size: {
    xs: fontSize.xs,
    sm: fontSize.sm,
    base: fontSize.base,
    md: fontSize.md,
    lg: fontSize.lg,
    xl: fontSize.xl,
    '2xl': fontSize['2xl'],
    '3xl': fontSize['3xl'],
    '4xl': fontSize['4xl'],
  },
  weight: {
    regular: fontWeight.regular,
    medium: fontWeight.medium,
    semibold: fontWeight.semibold,
    bold: fontWeight.bold,
  },
  lineHeight: {
    tight: fontSize.base * lineHeight.tight,
    snug: fontSize.base * lineHeight.snug,
    normal: fontSize.base * lineHeight.normal,
    relaxed: fontSize.base * lineHeight.relaxed,
  },
  letterSpacing: {
    tight: -0.16,
    normal: 0,
    wide: 0.8,
  },
  face: {
    400: { normal: 'Inter-Regular' },
    500: { normal: 'Inter-Medium' },
    600: { normal: 'Inter-SemiBold' },
    700: { normal: 'Inter-Bold' },
  },
});

// ---------------------------------------------------------------------------
// Animations — tied to token motion values.
// ---------------------------------------------------------------------------

const animations = createAnimations({
  fast: {
    type: 'timing',
    duration: motion.duration.fast,
  },
  base: {
    type: 'timing',
    duration: motion.duration.base,
  },
  slow: {
    type: 'timing',
    duration: motion.duration.slow,
  },
  bouncy: {
    type: 'spring',
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
});

// ---------------------------------------------------------------------------
// Media (responsive props).
// ---------------------------------------------------------------------------

const media = createMedia({
  sm: { maxWidth: breakpoint.sm },
  md: { maxWidth: breakpoint.md },
  lg: { maxWidth: breakpoint.lg },
  xl: { maxWidth: breakpoint.xl },
});

// ---------------------------------------------------------------------------
// Final config.
// ---------------------------------------------------------------------------

export const config = createTamagui({
  defaultTheme: 'dark',
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,

  shorthands,
  fonts: {
    body: interFont,
    heading: interFont,
  },
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  tokens,
  animations,
  media,

  // Enable RTL support; mobile users in some locales need it (e.g., Arabic).
  // Phase 3 i18n fully wires this up; for now the flag is on by default.
  rtl: true,
});

export type AppConfig = typeof config;

// Tamagui needs this declaration merge to type-check `$primary`, `$space.4`, etc.
declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
