/**
 * captureStore.ts — state machine for the scan capture flow.
 *
 * Five steps per F6.1: pick-horse → pick-boot → measuring → details → save.
 * Local-first per E1 — Realm write happens before the API call; sync
 * engine (T1.25) handles eventual consistency.
 *
 * 'measuring' is the BLE state machine state from plan.md § 3.3 — only
 * one Boot may be in measuring at a time on this device. The pairing
 * store (T1.20) and adjacency store (T1.21) are aware of this rule
 * because they only enter `connected` / read-only `inRange`; the active
 * device handle lives here for the duration of `measuring`.
 */

import { create } from 'zustand';

import { createScan as apiCreateScan } from '@/api/scans';
import { useAuthStore } from '@/auth';
import {
  START_COMMAND_BASE64,
  TEMPPULSE_CHAR,
  TEMPPULSE_SERVICE_UUID,
} from '@/ble/constants';
import { type BleDevice, getManager } from '@/ble/manager';
import { newId } from '@/db/realm';
import { createScan as realmCreateScan } from '@/db/repositories/scans';
import type { Leg } from '@/db/schemas';

import { decodeBase64Payload, readingsFromFloats } from './decode';

export type CaptureStep =
  | 'pick-horse'
  | 'pick-boot'
  | 'connecting'
  | 'measuring'
  | 'measured'
  | 'details'
  | 'saving'
  | 'done'
  | 'error';

export type CaptureError = {
  code:
    | 'no-native-module'
    | 'connection-failed'
    | 'measurement-failed'
    | 'measurement-timeout'
    | 'payload-malformed'
    | 'save-failed'
    | 'no-org';
  message: string;
};

export type CaptureContext = {
  step: CaptureStep;
  horseId: string | null;
  unassigned: boolean;
  bootId: string | null;
  bootDeviceId: string | null;
  leg: Leg;
  activityType: string;
  intensity: number | null;
  durationMinutes: number | null;
  footing: string;
  notes: string;
  capturedAt: Date | null;
  /** Decoded sensor readings (length = 184 once 'measured'). */
  readings: Array<{ sensorIndex: number; region: string; tempF: number }>;
  error: CaptureError | null;
  /**
   * UUIDv7 generated at start; reused for the API's clientId so retries
   * collapse onto the same scan (backend's idempotency surface).
   */
  clientId: string;
};

const MEASUREMENT_TIMEOUT_MS = 60_000;

type CaptureActions = {
  start: (input: { horseId: string | null; unassigned?: boolean }) => void;
  pickBoot: (boot: { bootId: string; deviceId: string }) => Promise<void>;
  setLeg: (leg: Leg) => void;
  setActivity: (a: Partial<{
    activityType: string;
    intensity: number | null;
    durationMinutes: number | null;
    footing: string;
    notes: string;
  }>) => void;
  save: () => Promise<{ ok: boolean; error?: CaptureError }>;
  reset: () => void;
};

const initialContext = (): CaptureContext => ({
  step: 'pick-horse',
  horseId: null,
  unassigned: false,
  bootId: null,
  bootDeviceId: null,
  leg: 'FL',
  activityType: '',
  intensity: null,
  durationMinutes: null,
  footing: '',
  notes: '',
  capturedAt: null,
  readings: [],
  error: null,
  clientId: newId(),
});

export const useCaptureStore = create<CaptureContext & CaptureActions>(
  (set, get) => {
    let activeDevice: BleDevice | null = null;
    let measurementTimeout: ReturnType<typeof setTimeout> | null = null;

    const cleanupBle = async () => {
      if (measurementTimeout) {
        clearTimeout(measurementTimeout);
        measurementTimeout = null;
      }
      if (activeDevice) {
        try {
          await activeDevice.cancelConnection();
        } catch {
          // ignore
        }
        activeDevice = null;
      }
    };

    return {
      ...initialContext(),

      start: ({ horseId, unassigned }) => {
        set({
          ...initialContext(),
          horseId,
          unassigned: !!unassigned || horseId === null,
          step: 'pick-boot',
        });
      },

      pickBoot: async ({ bootId, deviceId }) => {
        const manager = await getManager();
        if (!manager) {
          set({
            step: 'error',
            error: {
              code: 'no-native-module',
              message:
                'Bluetooth needs the dev client (Expo Go cannot include the BLE module).',
            },
          });
          return;
        }
        set({ step: 'connecting', bootId, bootDeviceId: deviceId, error: null });
        const m = manager as unknown as {
          connectToDevice: (id: string) => Promise<BleDevice>;
        };
        let device: BleDevice;
        try {
          device = await m.connectToDevice(deviceId);
          await device.discoverAllServicesAndCharacteristics();
        } catch (e) {
          set({
            step: 'error',
            error: {
              code: 'connection-failed',
              message:
                e instanceof Error
                  ? e.message
                  : 'Could not connect to the Smart Boot.',
            },
          });
          return;
        }
        activeDevice = device;
        set({ step: 'measuring' });
        await beginMeasurement(device);
      },

      setLeg: (leg) => set({ leg }),

      setActivity: (a) => set((s) => ({ ...s, ...a })),

      save: async () => {
        const s = get();
        const principal = useAuthStore.getState().user;
        const memberships = useAuthStore.getState().memberships;
        const orgId = memberships[0]?.organizationId;
        if (!orgId || !principal) {
          const error: CaptureError = {
            code: 'no-org',
            message: 'No barn yet — finish profile completion first.',
          };
          set({ step: 'error', error });
          return { ok: false, error };
        }
        if (s.readings.length === 0) {
          const error: CaptureError = {
            code: 'measurement-failed',
            message: 'No readings captured yet.',
          };
          set({ step: 'error', error });
          return { ok: false, error };
        }

        set({ step: 'saving' });
        const capturedAt = s.capturedAt ?? new Date();
        try {
          await realmCreateScan({
            clientId: s.clientId,
            horseId: s.horseId,
            organizationId: orgId,
            bootId: s.bootId,
            capturedByUserId: principal.id,
            leg: s.leg,
            capturedAt,
            activityType: s.activityType || undefined,
            intensity: s.intensity ?? undefined,
            durationMinutes: s.durationMinutes ?? undefined,
            footing: s.footing || undefined,
            notes: s.notes || undefined,
            unassigned: s.unassigned,
            readings: s.readings,
          });
        } catch (e) {
          const error: CaptureError = {
            code: 'save-failed',
            message:
              e instanceof Error ? e.message : 'Could not save the scan locally.',
          };
          set({ step: 'error', error });
          return { ok: false, error };
        }

        const apiRes = await apiCreateScan({
          clientId: s.clientId,
          horseId: s.horseId,
          bootId: s.bootId,
          leg: s.leg,
          capturedAt: capturedAt.toISOString(),
          activity: {
            type: s.activityType || undefined,
            intensity: s.intensity ?? undefined,
            durationMinutes: s.durationMinutes ?? undefined,
            footing: s.footing || undefined,
          },
          notes: s.notes || undefined,
          readings: s.readings,
        });
        if (
          !apiRes.ok &&
          apiRes.code !== 'network' &&
          apiRes.status !== 0
        ) {
          // Local row already exists; sync engine (T1.25) will retry.
          // For non-network errors (4xx/5xx) we still let the user move on
          // but log the message so it surfaces.
          // eslint-disable-next-line no-console
          console.warn('Scan API write failed:', apiRes.message);
        }
        await cleanupBle();
        set({ step: 'done' });
        return { ok: true };
      },

      reset: () => {
        void cleanupBle();
        set(initialContext());
      },
    };

    async function beginMeasurement(device: BleDevice) {
      try {
        // Subscribe to data characteristic before sending START.
        const sub = device.monitorCharacteristicForService(
          TEMPPULSE_SERVICE_UUID,
          TEMPPULSE_CHAR.data,
          (err, c) => {
            if (err) {
              void cleanupBle();
              set({
                step: 'error',
                error: {
                  code: 'measurement-failed',
                  message:
                    err instanceof Error
                      ? err.message
                      : 'BLE notification error.',
                },
              });
              return;
            }
            if (!c?.value) return;
            try {
              const floats = decodeBase64Payload(c.value);
              const readings = readingsFromFloats(floats);
              set({
                step: 'measured',
                readings,
                capturedAt: new Date(),
              });
              sub.remove();
              // Move into details — user fills activity context.
              set({ step: 'details' });
            } catch (e) {
              void cleanupBle();
              set({
                step: 'error',
                error: {
                  code: 'payload-malformed',
                  message:
                    e instanceof Error
                      ? e.message
                      : 'Smart Boot returned a malformed payload.',
                },
              });
              sub.remove();
            }
          },
        );

        measurementTimeout = setTimeout(() => {
          if (get().step === 'measuring') {
            sub.remove();
            void cleanupBle();
            set({
              step: 'error',
              error: {
                code: 'measurement-timeout',
                message:
                  'Did not receive a full reading within 60 seconds. Move closer to the boot and try again.',
              },
            });
          }
        }, MEASUREMENT_TIMEOUT_MS);

        await device.writeCharacteristicWithResponseForService(
          TEMPPULSE_SERVICE_UUID,
          TEMPPULSE_CHAR.control,
          START_COMMAND_BASE64,
        );
      } catch (e) {
        await cleanupBle();
        set({
          step: 'error',
          error: {
            code: 'measurement-failed',
            message:
              e instanceof Error
                ? e.message
                : 'Could not start measurement on the Smart Boot.',
          },
        });
      }
    }
  },
);
