/**
 * preferencesStore.ts — Zustand-backed mirror of the persisted prefs.
 *
 * Initialized once on cold start via `bootstrapPreferences()` (called
 * from AppProviders). UI components subscribe to keys via the standard
 * useStore selector pattern.
 */

import { create } from 'zustand';

import {
  type HeightUnitPref,
  loadPreferences,
  type Preferences,
  savePreference,
  type TempUnitPref,
  type ThemePref,
  type WeightUnitPref,
} from './preferences';

type PreferencesState = Preferences & {
  hydrated: boolean;
  setTheme: (theme: ThemePref) => Promise<void>;
  setTempUnit: (u: TempUnitPref) => Promise<void>;
  setHeightUnit: (u: HeightUnitPref) => Promise<void>;
  setWeightUnit: (u: WeightUnitPref) => Promise<void>;
  hydrate: () => Promise<void>;
};

export const usePreferencesStore = create<PreferencesState>((set) => ({
  hydrated: false,
  theme: 'system',
  tempUnit: 'F',
  heightUnit: 'hands',
  weightUnit: 'lbs',

  hydrate: async () => {
    const p = await loadPreferences();
    set({ ...p, hydrated: true });
  },
  setTheme: async (theme) => {
    set({ theme });
    await savePreference('theme', theme);
  },
  setTempUnit: async (tempUnit) => {
    set({ tempUnit });
    await savePreference('tempUnit', tempUnit);
  },
  setHeightUnit: async (heightUnit) => {
    set({ heightUnit });
    await savePreference('heightUnit', heightUnit);
  },
  setWeightUnit: async (weightUnit) => {
    set({ weightUnit });
    await savePreference('weightUnit', weightUnit);
  },
}));
