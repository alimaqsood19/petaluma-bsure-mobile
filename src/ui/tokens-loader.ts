/**
 * tokens-loader.ts
 *
 * Loads `tokens.json` and converts the nested `{ value, _doc }` structure
 * into flat token objects that Tamagui's `createTokens()` API expects.
 *
 * The loader strips `_meta`, `_doc`, and any other underscore-prefixed keys.
 * Color values are passed through unchanged; `space`, `radius`, `fontSize`,
 * etc. are returned as numbers or strings depending on the JSON.
 *
 * This indirection is what lets Claude Design produce a refined `tokens.json`
 * and have it flow into the Tamagui config without code changes — the file is
 * the contract, the loader does the wiring.
 */

import tokensJson from '../../tokens.json';

type RawTokenValue = { value: string | number; _doc?: string };
type RawTokenGroup = Record<string, RawTokenValue | Record<string, RawTokenValue>>;

/**
 * Recursively flatten a token group, stripping `_doc` and `_meta` keys.
 * Returns a plain `{ key: value }` object suitable for Tamagui.
 */
function flatten<T extends Record<string, unknown>>(group: T): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [key, raw] of Object.entries(group)) {
    if (key.startsWith('_')) continue;
    if (raw && typeof raw === 'object' && 'value' in (raw as object)) {
      out[key] = (raw as RawTokenValue).value;
    }
    // Note: nested groups (e.g., color.brand.*) are kept nested intentionally
    // — the consumer (`tamagui.config.ts`) flattens with explicit semantic keys.
  }
  return out;
}

// Color tokens — keep nested structure for clarity at the call site.
export const colors = {
  brand: flatten(tokensJson.color.brand),
  temperature: flatten(tokensJson.color.temperature),
  neutral: flatten(tokensJson.color.neutral),
  feedback: flatten(tokensJson.color.feedback),
  surface: {
    light: flatten(tokensJson.color.surface.light),
    dark: flatten(tokensJson.color.surface.dark),
  },
  text: {
    light: flatten(tokensJson.color.text.light),
    dark: flatten(tokensJson.color.text.dark),
  },
};

export const space = flatten(tokensJson.space) as Record<string, number>;
export const radius = flatten(tokensJson.radius) as Record<string, number>;
export const shadow = flatten(tokensJson.shadow) as Record<string, string>;
export const zIndex = flatten(tokensJson.zIndex) as Record<string, number>;
export const breakpoint = flatten(tokensJson.breakpoint) as Record<string, number>;

export const fontSize = flatten(tokensJson.typography.fontSize) as Record<string, number>;
export const fontWeight = flatten(tokensJson.typography.fontWeight) as Record<string, string>;
export const lineHeight = flatten(tokensJson.typography.lineHeight) as Record<string, number>;
export const letterSpacing = flatten(tokensJson.typography.letterSpacing) as Record<string, string>;
export const fontFamily = flatten(tokensJson.typography.fontFamily) as Record<string, string>;

export const motion = {
  duration: flatten(tokensJson.motion.duration) as Record<string, number>,
  easing: flatten(tokensJson.motion.easing) as Record<string, string>,
};

export const meta = tokensJson._meta;
