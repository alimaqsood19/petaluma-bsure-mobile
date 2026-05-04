/**
 * decode.ts — parse the 184-float payload from the TempPulse data
 * characteristic (ADR 0009). Floats are little-endian Float32.
 *
 * Currently the BLE module returns the characteristic value as a base64
 * string. We turn it into a Uint8Array, then a Float32Array. Endianness
 * is little-endian per the firmware contract.
 */

import { SENSOR_COUNT } from '@/ble/constants';
import { regionFor } from './regions';

export type DecodedReading = {
  sensorIndex: number;
  region: ReturnType<typeof regionFor>;
  tempF: number;
};

export function decodeBase64Payload(base64: string): Float32Array {
  const bin = globalThis.atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  if (bytes.byteLength % 4 !== 0) {
    throw new Error(
      `BLE payload length ${bytes.byteLength} bytes is not a multiple of 4 — expected float32 stream.`,
    );
  }
  return new Float32Array(bytes.buffer);
}

export function readingsFromFloats(floats: Float32Array): DecodedReading[] {
  if (floats.length !== SENSOR_COUNT) {
    throw new Error(
      `Expected ${SENSOR_COUNT} sensor readings, received ${floats.length} — firmware may have changed (ADR 0009).`,
    );
  }
  const out: DecodedReading[] = new Array(SENSOR_COUNT);
  for (let i = 0; i < SENSOR_COUNT; i++) {
    out[i] = {
      sensorIndex: i,
      region: regionFor(i),
      tempF: floats[i] ?? 0,
    };
  }
  return out;
}

/** Test helper — generate a deterministic 184-float fake payload. */
export function fakePayload(seed = 95): Float32Array {
  const arr = new Float32Array(SENSOR_COUNT);
  for (let i = 0; i < SENSOR_COUNT; i++) {
    arr[i] = seed + Math.sin(i / 8) * 0.6 + (i % 7) * 0.05;
  }
  return arr;
}
