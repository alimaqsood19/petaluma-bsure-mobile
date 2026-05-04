/**
 * manager.ts — singleton BLE wrapper.
 *
 * Owns the lifecycle of the underlying BleManager so we never hold more
 * than one CBCentralManager / BluetoothAdapter handle at a time. The
 * permission gate (T1.18) and state machine (this file's siblings) both
 * route through `getManager()`.
 *
 * Lazy-loaded so Expo Go bundles cleanly even though it can't load the
 * native module.
 */

let _manager: unknown | null = null;
let _loading: Promise<unknown | null> | null = null;

type AnyBleManager = {
  startDeviceScan: (
    uuids: string[] | null,
    options: unknown,
    listener: (err: unknown, device: BleDevice | null) => void,
  ) => void;
  stopDeviceScan: () => void;
  state: () => Promise<string>;
  destroy?: () => void;
};

export type BleDevice = {
  id: string;
  name: string | null;
  rssi: number | null;
  serviceUUIDs?: string[] | null;
  manufacturerData?: string | null;
  connect: () => Promise<BleDevice>;
  discoverAllServicesAndCharacteristics: () => Promise<BleDevice>;
  cancelConnection: () => Promise<BleDevice>;
  isConnected: () => Promise<boolean>;
  onDisconnected: (
    listener: (err: unknown, device: BleDevice | null) => void,
  ) => { remove: () => void };
  services: () => Promise<unknown[]>;
  readCharacteristicForService: (
    serviceUuid: string,
    characteristicUuid: string,
  ) => Promise<{ value: string | null }>;
  writeCharacteristicWithResponseForService: (
    serviceUuid: string,
    characteristicUuid: string,
    base64Value: string,
  ) => Promise<unknown>;
  monitorCharacteristicForService: (
    serviceUuid: string,
    characteristicUuid: string,
    listener: (err: unknown, c: { value: string | null } | null) => void,
  ) => { remove: () => void };
};

export async function getManager(): Promise<AnyBleManager | null> {
  if (_manager) return _manager as AnyBleManager;
  if (_loading) return _loading as Promise<AnyBleManager | null>;
  _loading = loadManager();
  try {
    _manager = (await _loading) ?? null;
    return _manager as AnyBleManager | null;
  } finally {
    _loading = null;
  }
}

async function loadManager(): Promise<AnyBleManager | null> {
  try {
    const mod = await import('react-native-ble-plx');
    return new mod.BleManager() as unknown as AnyBleManager;
  } catch {
    return null;
  }
}

export async function destroyManager(): Promise<void> {
  if (_manager && typeof (_manager as AnyBleManager).destroy === 'function') {
    (_manager as AnyBleManager).destroy?.();
  }
  _manager = null;
  _loading = null;
}
