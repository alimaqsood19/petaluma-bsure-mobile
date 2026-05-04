/**
 * adjacency.ts — runs a brief BLE scan and matches discovered boots
 * against the paired list in Realm.
 *
 * Used by the Boot picker (T1.21) before scan capture (T1.23) and Quick
 * Read (T1.24). The 'measuring' state from plan.md § 3.3 doesn't enter
 * here — adjacency only listens for advertisements; it never connects.
 *
 * The match key is the BLE device's advertised serial (when firmware
 * exposes it) or its ID. Realm stores `Boot.serial` as the canonical
 * unique key per ADR 0009; we trust serial-from-advertisement when
 * available, fall back to device id otherwise.
 */

import { create } from 'zustand';

import { TEMPPULSE_SERVICE_UUID } from './constants';
import { type BleDevice, getManager } from './manager';

export type InRangeBoot = {
  deviceId: string;
  advertisedName: string | null;
  rssi: number | null;
  /** Advertisement timestamp in ms — used by the picker to age out stale entries. */
  lastSeenAt: number;
};

const ADJACENCY_TTL_MS = 8_000;
const DEFAULT_SCAN_DURATION_MS = 6_000;

type AdjacencyState = {
  scanning: boolean;
  inRange: InRangeBoot[];
  error: string | null;
  startScan: (durationMs?: number) => Promise<void>;
  stopScan: () => Promise<void>;
  reset: () => void;
};

export const useAdjacencyStore = create<AdjacencyState>((set, get) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const stopUnderlying = async () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    const manager = await getManager();
    manager?.stopDeviceScan();
  };

  return {
    scanning: false,
    inRange: [],
    error: null,

    startScan: async (durationMs = DEFAULT_SCAN_DURATION_MS) => {
      const manager = await getManager();
      if (!manager) {
        set({
          error:
            'Bluetooth needs the dev client (Expo Go cannot include the BLE module).',
        });
        return;
      }
      set({ scanning: true, inRange: [], error: null });
      manager.startDeviceScan(
        [TEMPPULSE_SERVICE_UUID],
        null,
        (err: unknown, device: BleDevice | null) => {
          if (err) {
            set({
              error: err instanceof Error ? err.message : 'Bluetooth scan failed',
            });
            return;
          }
          if (!device) return;
          const now = Date.now();
          set((s) => {
            const existing = s.inRange.findIndex((b) => b.deviceId === device.id);
            const next: InRangeBoot = {
              deviceId: device.id,
              advertisedName: device.name ?? null,
              rssi: device.rssi ?? null,
              lastSeenAt: now,
            };
            if (existing === -1) {
              return { ...s, inRange: [...s.inRange, next] };
            }
            const copy = [...s.inRange];
            copy[existing] = next;
            return { ...s, inRange: copy };
          });
        },
      );
      timeout = setTimeout(() => {
        void get().stopScan();
      }, durationMs);
    },

    stopScan: async () => {
      await stopUnderlying();
      set({ scanning: false });
    },

    reset: () => {
      void stopUnderlying();
      set({ scanning: false, inRange: [], error: null });
    },
  };
});

export function pruneStale(
  inRange: InRangeBoot[],
  now: number = Date.now(),
): InRangeBoot[] {
  return inRange.filter((b) => now - b.lastSeenAt < ADJACENCY_TTL_MS);
}

export type PairedBootRow = {
  id: string;
  serial: string;
  name?: string;
  lastBatteryPct?: number | null;
};

export type BootAdjacencyEntry = {
  paired: PairedBootRow;
  inRange: boolean;
  rssi: number | null;
  advertisedDeviceId: string | null;
};

/**
 * Cross-reference paired boots against currently-discovered ones.
 * Sorting: in-range first (sorted by RSSI desc), then out-of-range.
 */
export function mergeAdjacency(
  paired: PairedBootRow[],
  inRange: InRangeBoot[],
  now: number = Date.now(),
): BootAdjacencyEntry[] {
  const fresh = pruneStale(inRange, now);
  // Match keys: prefer serial in advertised name (firmware doesn't normally
  // do this, but if it ever does we honour it); else fall back to deviceId
  // which means we can only match by "any of the known paired serials" —
  // resolving the ambiguity via the device id mapping kept by the pairing
  // flow is a Phase 2 refinement.
  const merged: BootAdjacencyEntry[] = paired.map((p) => {
    const adv = fresh.find(
      (d) => d.advertisedName?.includes(p.serial) ?? false,
    );
    return {
      paired: p,
      inRange: !!adv,
      rssi: adv?.rssi ?? null,
      advertisedDeviceId: adv?.deviceId ?? null,
    };
  });
  merged.sort((a, b) => {
    if (a.inRange !== b.inRange) return a.inRange ? -1 : 1;
    return (b.rssi ?? -999) - (a.rssi ?? -999);
  });
  return merged;
}
