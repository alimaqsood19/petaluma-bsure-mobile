/**
 * Smart Boot BLE / firmware contract — fixed per ADR 0009.
 *
 * The boot defines this contract; the app adapts. Do NOT change these
 * UUIDs or commands — verified via the legacy esb-mobile-dev project and
 * snapshotted in ADR 0009 to detect drift at runtime.
 */

export const TEMPPULSE_SERVICE_UUID = '1e265423-3373-42ea-bb00-e47296c400a9';

export const TEMPPULSE_CHAR = {
  /** Bulk data — used by the scan flow (T1.23) to receive 184-float payloads. */
  data: '54111fd1-2344-4ce7-a86e-7c84c0e75fc1',
  /** Control — accepts the ASCII "ST" start command. */
  control: '54111fd1-2344-4ce7-a86e-7c84c0e75fc2',
  /** Continuous-temp stream — Phase 2 surfaces. */
  stream: '54111fd1-2344-4ce7-a86e-7c84c0e75fc3',
  /** Boot status reports (battery, in-progress scan, errors). */
  status: '54111fd1-2344-4ce7-a86e-7c84c0e75fc4',
} as const;

export const GATT_SERVICE = {
  deviceInfo: '180A',
  battery: '180F',
} as const;

export const GATT_CHAR = {
  serialNumber: '2A25',
  firmwareRevision: '2A26',
  batteryLevel: '2A19',
} as const;

/** ASCII "ST" — base64 = "U1Q=". */
export const START_COMMAND_ASCII = 'ST';
export const START_COMMAND_BASE64 = 'U1Q=';

/** Number of float readings in one scan payload. */
export const SENSOR_COUNT = 184;
