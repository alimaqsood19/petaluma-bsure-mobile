/**
 * BLE permission state store.
 *
 * Caches the most recently observed status so the UI can render the
 * appropriate gate (interstitial vs proceed) without re-querying on
 * every render. Refreshed by `useBleStore.getState().refresh()`,
 * which the scan/quick-read screens call on focus.
 *
 * Full BLE manager + state machine (idle → scanning → ...) lands in T1.20.
 */

import { create } from 'zustand';

import {
  getBlePermissionStatus,
  requestBlePermissions,
  type BlePermissionStatus,
} from './permissions';

type BleState = {
  status: BlePermissionStatus | 'unknown';
  lastCheckedAt: number | null;
  refresh: () => Promise<BlePermissionStatus>;
  request: () => Promise<BlePermissionStatus>;
};

export const useBleStore = create<BleState>((set) => ({
  status: 'unknown',
  lastCheckedAt: null,
  refresh: async () => {
    const next = await getBlePermissionStatus();
    set({ status: next, lastCheckedAt: Date.now() });
    return next;
  },
  request: async () => {
    const next = await requestBlePermissions();
    set({ status: next, lastCheckedAt: Date.now() });
    return next;
  },
}));
