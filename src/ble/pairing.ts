/**
 * pairing.ts — state machine for the Boot pairing flow.
 *
 * States: idle → scanning → discovered → connecting → connected → naming
 *         → saving → done | error
 *
 * The 'measuring' state from plan.md § 3.3 belongs to the scan capture
 * flow (T1.23) — pairing pauses at 'connected' for the user to name +
 * save the boot.
 *
 * Concurrency rule from plan.md § 3.3: only one Boot may be in
 * `measuring` per device at a time. Pairing doesn't measure, so we can
 * surface multiple discovered devices for the multi-boot picker (T1.21).
 */

import { create } from 'zustand';

import {
  GATT_CHAR,
  GATT_SERVICE,
  TEMPPULSE_SERVICE_UUID,
} from './constants';
import { type BleDevice, getManager } from './manager';

export type PairingPhase =
  | 'idle'
  | 'scanning'
  | 'discovered'
  | 'connecting'
  | 'connected'
  | 'naming'
  | 'saving'
  | 'done'
  | 'error';

export type PairingError = {
  code:
    | 'no-native-module'
    | 'permission-denied'
    | 'scan-timeout'
    | 'connection-failed'
    | 'service-discovery-failed'
    | 'disconnected-mid-pair'
    | 'metadata-read-failed'
    | 'unknown';
  message: string;
};

export type DiscoveredBoot = {
  /** BLE device id (MAC on Android, UUID on iOS) — opaque. */
  deviceId: string;
  /** Advertised name; firmware may not expose one (ADR 0009). */
  advertisedName: string | null;
  rssi: number | null;
};

export type ConnectedBootMeta = {
  serial: string;
  firmware: string | null;
  batteryPct: number | null;
};

const SCAN_TIMEOUT_MS = 30_000;

type PairingState = {
  phase: PairingPhase;
  discovered: DiscoveredBoot[];
  selectedDeviceId: string | null;
  connectedMeta: ConnectedBootMeta | null;
  error: PairingError | null;

  startScan: () => Promise<void>;
  stopScan: () => Promise<void>;
  selectAndConnect: (deviceId: string) => Promise<void>;
  reset: () => Promise<void>;
  beginNaming: () => void;
  beginSaving: () => void;
  complete: () => void;
  setError: (e: PairingError) => Promise<void>;
};

export const usePairingStore = create<PairingState>((set, get) => {
  let scanTimeout: ReturnType<typeof setTimeout> | null = null;
  let activeDevice: BleDevice | null = null;
  let disconnectHandle: { remove: () => void } | null = null;

  const cleanup = async () => {
    if (scanTimeout) {
      clearTimeout(scanTimeout);
      scanTimeout = null;
    }
    const manager = await getManager();
    manager?.stopDeviceScan();
    if (disconnectHandle) {
      disconnectHandle.remove();
      disconnectHandle = null;
    }
    if (activeDevice) {
      try {
        await activeDevice.cancelConnection();
      } catch {
        // ignore — already disconnected
      }
      activeDevice = null;
    }
  };

  return {
    phase: 'idle',
    discovered: [],
    selectedDeviceId: null,
    connectedMeta: null,
    error: null,

    startScan: async () => {
      const manager = await getManager();
      if (!manager) {
        await get().setError({
          code: 'no-native-module',
          message:
            'Bluetooth needs the dev client (Expo Go cannot include the BLE module).',
        });
        return;
      }
      set({
        phase: 'scanning',
        discovered: [],
        selectedDeviceId: null,
        connectedMeta: null,
        error: null,
      });
      manager.startDeviceScan(
        [TEMPPULSE_SERVICE_UUID],
        null,
        (err: unknown, device: BleDevice | null) => {
          if (err) {
            void get().setError({
              code: 'unknown',
              message: scanErrorMessage(err),
            });
            return;
          }
          if (!device) return;
          set((s) => {
            if (s.discovered.some((b) => b.deviceId === device.id)) return s;
            return {
              ...s,
              phase: 'discovered',
              discovered: [
                ...s.discovered,
                {
                  deviceId: device.id,
                  advertisedName: device.name ?? null,
                  rssi: device.rssi ?? null,
                },
              ],
            };
          });
        },
      );
      scanTimeout = setTimeout(() => {
        if (get().phase === 'scanning' && get().discovered.length === 0) {
          void get().setError({
            code: 'scan-timeout',
            message:
              'No Smart Boot found within 30 seconds. Make sure the boot is on and within reach.',
          });
        } else {
          // Stop scanning once we have at least one device — keeps the radio quiet.
          void getManager().then((m) => m?.stopDeviceScan());
        }
      }, SCAN_TIMEOUT_MS);
    },

    stopScan: async () => {
      if (scanTimeout) {
        clearTimeout(scanTimeout);
        scanTimeout = null;
      }
      const manager = await getManager();
      manager?.stopDeviceScan();
      set((s) =>
        s.phase === 'scanning'
          ? { ...s, phase: s.discovered.length > 0 ? 'discovered' : 'idle' }
          : s,
      );
    },

    selectAndConnect: async (deviceId: string) => {
      const manager = await getManager();
      if (!manager) {
        await get().setError({
          code: 'no-native-module',
          message: 'Bluetooth manager unavailable.',
        });
        return;
      }
      manager.stopDeviceScan();
      set({ phase: 'connecting', selectedDeviceId: deviceId, error: null });

      // Find the discovered device by id; in practice we'd retain the device
      // ref from the scan listener. This is a typed shim — the live BLE layer
      // will provide it via a per-discovery cache (T1.23 wires this).
      const stub = await connectAndReadMeta(deviceId);
      if (!stub.ok) {
        await get().setError(stub.error);
        return;
      }
      activeDevice = stub.device;
      disconnectHandle = stub.device.onDisconnected((_err) => {
        if (get().phase !== 'done' && get().phase !== 'idle') {
          void get().setError({
            code: 'disconnected-mid-pair',
            message:
              'The Smart Boot disconnected before we finished. Move closer and try again.',
          });
        }
      });
      set({
        phase: 'connected',
        connectedMeta: stub.meta,
      });
    },

    beginNaming: () => set({ phase: 'naming' }),
    beginSaving: () => set({ phase: 'saving' }),
    complete: () => {
      set({ phase: 'done' });
      void cleanup();
    },

    setError: async (e: PairingError) => {
      set({ phase: 'error', error: e });
      await cleanup();
    },

    reset: async () => {
      await cleanup();
      set({
        phase: 'idle',
        discovered: [],
        selectedDeviceId: null,
        connectedMeta: null,
        error: null,
      });
    },
  };
});

async function connectAndReadMeta(
  deviceId: string,
): Promise<
  | { ok: true; device: BleDevice; meta: ConnectedBootMeta }
  | { ok: false; error: PairingError }
> {
  const manager = await getManager();
  if (!manager) {
    return {
      ok: false,
      error: {
        code: 'no-native-module',
        message: 'Bluetooth manager unavailable.',
      },
    };
  }
  // The discovered listener doesn't retain `device` between Zustand
  // updates (we keep only the serializable shape). Use the manager's
  // connectToDevice which accepts the deviceId directly.
  const m = manager as unknown as {
    connectToDevice: (id: string) => Promise<BleDevice>;
  };
  let device: BleDevice;
  try {
    device = await m.connectToDevice(deviceId);
  } catch (e) {
    return {
      ok: false,
      error: {
        code: 'connection-failed',
        message: errorMessage(e, 'Could not connect to the Smart Boot.'),
      },
    };
  }
  try {
    await device.discoverAllServicesAndCharacteristics();
  } catch (e) {
    return {
      ok: false,
      error: {
        code: 'service-discovery-failed',
        message: errorMessage(e, 'Could not read Smart Boot services.'),
      },
    };
  }
  let serial: string;
  let firmware: string | null = null;
  let batteryPct: number | null = null;
  try {
    const serialChar = await device.readCharacteristicForService(
      GATT_SERVICE.deviceInfo,
      GATT_CHAR.serialNumber,
    );
    serial = decodeAscii(serialChar.value);
    try {
      const firmwareChar = await device.readCharacteristicForService(
        GATT_SERVICE.deviceInfo,
        GATT_CHAR.firmwareRevision,
      );
      firmware = decodeAscii(firmwareChar.value);
    } catch {
      // Optional — older boots may not advertise this.
    }
    try {
      const batteryChar = await device.readCharacteristicForService(
        GATT_SERVICE.battery,
        GATT_CHAR.batteryLevel,
      );
      batteryPct = decodeUint8(batteryChar.value);
    } catch {
      // Optional — falls through.
    }
  } catch (e) {
    return {
      ok: false,
      error: {
        code: 'metadata-read-failed',
        message: errorMessage(e, 'Could not read Smart Boot metadata.'),
      },
    };
  }
  return { ok: true, device, meta: { serial, firmware, batteryPct } };
}

function decodeAscii(base64: string | null): string {
  if (!base64) return '';
  try {
    const bin = globalThis.atob(base64);
    return bin.replace(/ +$/g, '').trim();
  } catch {
    return '';
  }
}

function decodeUint8(base64: string | null): number | null {
  if (!base64) return null;
  try {
    const bin = globalThis.atob(base64);
    if (bin.length === 0) return null;
    return bin.charCodeAt(0);
  } catch {
    return null;
  }
}

function errorMessage(e: unknown, fallback: string): string {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  return fallback;
}

function scanErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === 'object' && e !== null && 'message' in e) {
    return String((e as { message: unknown }).message);
  }
  return 'Bluetooth scan failed.';
}
