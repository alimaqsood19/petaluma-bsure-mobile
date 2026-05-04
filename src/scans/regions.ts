/**
 * Sensor index → anatomical region map.
 *
 * Provisional placeholder per plan.md § 5.3 / spec.md Q3 — final mapping
 * pending the hardware team's empirical calibration. Both mobile and
 * backend share this constant; if the backend's `regionFor()` helper
 * (in bsure-api/prisma/migrations/.../migration.sql) ever changes, mirror
 * the change here.
 */

import { SENSOR_COUNT } from '@/ble/constants';

export type Region =
  | 'hoof_band'
  | 'fetlock'
  | 'cannon'
  | 'tendon'
  | 'knee';

export const REGION_RANGES: Array<{
  region: Region;
  start: number;
  end: number;
}> = [
  { region: 'hoof_band', start: 0, end: 15 },
  { region: 'fetlock', start: 16, end: 47 },
  { region: 'cannon', start: 48, end: 103 },
  { region: 'tendon', start: 104, end: 151 },
  { region: 'knee', start: 152, end: 183 },
];

export function regionFor(sensorIndex: number): Region {
  for (const r of REGION_RANGES) {
    if (sensorIndex >= r.start && sensorIndex <= r.end) return r.region;
  }
  // Fallback — shouldn't happen with a 184-float payload.
  return 'cannon';
}

export function assertSensorCount(n: number): void {
  if (n !== SENSOR_COUNT) {
    throw new Error(
      `Expected ${SENSOR_COUNT} sensor readings, received ${n} — firmware may have changed (ADR 0009).`,
    );
  }
}
