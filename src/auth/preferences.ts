/**
 * preferences.ts — local-first user preferences (theme + units).
 *
 * Backed by expo-secure-store so they survive cold start. Mirrored into
 * the auth store for instant in-memory access. Best-effort PATCHed to
 * the API when LOCAL_DEV / Cognito wiring matures (T1.17 backend gap
 * tracked in STUBS.md).
 *
 * Per F10.1 (theme picker) + F10.2 (units picker).
 */

import * as SecureStore from 'expo-secure-store';

export type ThemePref = 'system' | 'light' | 'dark';
export type TempUnitPref = 'F' | 'C';
export type HeightUnitPref = 'hands' | 'cm';
export type WeightUnitPref = 'lbs' | 'kg';

const KEYS = {
  theme: 'bsure.prefs.theme',
  tempUnit: 'bsure.prefs.tempUnit',
  heightUnit: 'bsure.prefs.heightUnit',
  weightUnit: 'bsure.prefs.weightUnit',
} as const;

export type Preferences = {
  theme: ThemePref;
  tempUnit: TempUnitPref;
  heightUnit: HeightUnitPref;
  weightUnit: WeightUnitPref;
};

const DEFAULTS: Preferences = {
  theme: 'system',
  tempUnit: 'F',
  heightUnit: 'hands',
  weightUnit: 'lbs',
};

export async function loadPreferences(): Promise<Preferences> {
  const [theme, tempUnit, heightUnit, weightUnit] = await Promise.all([
    SecureStore.getItemAsync(KEYS.theme),
    SecureStore.getItemAsync(KEYS.tempUnit),
    SecureStore.getItemAsync(KEYS.heightUnit),
    SecureStore.getItemAsync(KEYS.weightUnit),
  ]);
  return {
    theme: (asTheme(theme) ?? DEFAULTS.theme),
    tempUnit: (asTempUnit(tempUnit) ?? DEFAULTS.tempUnit),
    heightUnit: (asHeightUnit(heightUnit) ?? DEFAULTS.heightUnit),
    weightUnit: (asWeightUnit(weightUnit) ?? DEFAULTS.weightUnit),
  };
}

export async function savePreference<K extends keyof Preferences>(
  key: K,
  value: Preferences[K],
): Promise<void> {
  const storeKey =
    key === 'theme'
      ? KEYS.theme
      : key === 'tempUnit'
        ? KEYS.tempUnit
        : key === 'heightUnit'
          ? KEYS.heightUnit
          : KEYS.weightUnit;
  await SecureStore.setItemAsync(storeKey, String(value));
}

export async function clearPreferences(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(KEYS.theme),
    SecureStore.deleteItemAsync(KEYS.tempUnit),
    SecureStore.deleteItemAsync(KEYS.heightUnit),
    SecureStore.deleteItemAsync(KEYS.weightUnit),
  ]);
}

function asTheme(v: string | null): ThemePref | null {
  return v === 'system' || v === 'light' || v === 'dark' ? v : null;
}
function asTempUnit(v: string | null): TempUnitPref | null {
  return v === 'F' || v === 'C' ? v : null;
}
function asHeightUnit(v: string | null): HeightUnitPref | null {
  return v === 'hands' || v === 'cm' ? v : null;
}
function asWeightUnit(v: string | null): WeightUnitPref | null {
  return v === 'lbs' || v === 'kg' ? v : null;
}
