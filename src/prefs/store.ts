/**
 * Local user-preference store (theme + units) with secure-store
 * persistence so choices survive cold starts (F10.1, F10.2 DoD).
 *
 * Server-side persistence goes through PATCH /v1/me; the same
 * graceful-404 fallback as T1.17's profile completion applies — the
 * mobile preference takes effect immediately and re-syncs once the
 * backend exposes the prefs columns.
 */

import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import { apiRequest } from '@/api/client';
import { useAuthStore } from '@/auth';

const KEY_THEME = 'bsure.prefs.theme.v1';
const KEY_TEMP = 'bsure.prefs.tempUnit.v1';
const KEY_HEIGHT = 'bsure.prefs.heightUnit.v1';
const KEY_WEIGHT = 'bsure.prefs.weightUnit.v1';

export type ThemePref = 'system' | 'light' | 'dark';
export type TempUnit = 'F' | 'C';
export type HeightUnit = 'hands' | 'cm';
export type WeightUnit = 'lbs' | 'kg';

type PrefsState = {
  theme: ThemePref;
  tempUnit: TempUnit;
  heightUnit: HeightUnit;
  weightUnit: WeightUnit;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setTheme: (t: ThemePref) => Promise<void>;
  setTempUnit: (u: TempUnit) => Promise<void>;
  setHeightUnit: (u: HeightUnit) => Promise<void>;
  setWeightUnit: (u: WeightUnit) => Promise<void>;
};

export const usePrefsStore = create<PrefsState>((set, get) => ({
  theme: 'system',
  tempUnit: 'F',
  heightUnit: 'hands',
  weightUnit: 'lbs',
  hydrated: false,

  hydrate: async () => {
    try {
      const [t, temp, h, w] = await Promise.all([
        SecureStore.getItemAsync(KEY_THEME),
        SecureStore.getItemAsync(KEY_TEMP),
        SecureStore.getItemAsync(KEY_HEIGHT),
        SecureStore.getItemAsync(KEY_WEIGHT),
      ]);
      set({
        theme: isThemePref(t) ? t : 'system',
        tempUnit: isTempUnit(temp) ? temp : 'F',
        heightUnit: isHeightUnit(h) ? h : 'hands',
        weightUnit: isWeightUnit(w) ? w : 'lbs',
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },

  setTheme: async (t) => {
    set({ theme: t });
    await SecureStore.setItemAsync(KEY_THEME, t);
    void syncPref({ prefsTheme: t });
  },
  setTempUnit: async (u) => {
    set({ tempUnit: u });
    await SecureStore.setItemAsync(KEY_TEMP, u);
    void syncPref({ prefsTempUnit: u });
  },
  setHeightUnit: async (u) => {
    set({ heightUnit: u });
    await SecureStore.setItemAsync(KEY_HEIGHT, u);
    void syncPref({ prefsHeightUnit: u });
  },
  setWeightUnit: async (u) => {
    set({ weightUnit: u });
    await SecureStore.setItemAsync(KEY_WEIGHT, u);
    void syncPref({ prefsWeightUnit: u });
  },
}));

async function syncPref(patch: Record<string, unknown>): Promise<void> {
  if (useAuthStore.getState().status !== 'authenticated') return;
  // Best-effort PATCH /v1/me — degrades to local-only on 404 (same pattern
  // as T1.17 since the backend's prefs columns aren't surfaced yet).
  await apiRequest('/v1/me', { method: 'PATCH', body: patch });
}

function isThemePref(v: string | null): v is ThemePref {
  return v === 'system' || v === 'light' || v === 'dark';
}
function isTempUnit(v: string | null): v is TempUnit {
  return v === 'F' || v === 'C';
}
function isHeightUnit(v: string | null): v is HeightUnit {
  return v === 'hands' || v === 'cm';
}
function isWeightUnit(v: string | null): v is WeightUnit {
  return v === 'lbs' || v === 'kg';
}
