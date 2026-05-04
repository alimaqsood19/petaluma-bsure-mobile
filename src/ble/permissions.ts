/**
 * permissions.ts — cross-platform BLE permission gate.
 *
 * iOS: Bluetooth permission is auto-prompted by the OS the first time the
 * app uses CBCentralManager. The strings come from `app.json`'s
 * NSBluetoothAlwaysUsageDescription / NSBluetoothPeripheralUsageDescription.
 * We read the BleManager.state() to detect Unauthorized vs PoweredOff vs OK.
 *
 * Android 12+: Runtime permissions for BLUETOOTH_SCAN + BLUETOOTH_CONNECT
 * (and ACCESS_FINE_LOCATION on Android < 12). Requested via PermissionsAndroid.
 *
 * The full BLE state machine lives in src/ble/state.ts (T1.20). This module
 * is the smallest piece needed to satisfy F1.2 + F5.1 — surface a clear
 * "Bluetooth required" interstitial with a Settings deep link before the
 * scan flow is reachable.
 */

import { Linking, PermissionsAndroid, Platform } from 'react-native';

export type BlePermissionStatus =
  | 'granted'
  | 'denied'
  | 'blocked' // user has selected "never ask again"
  | 'powered-off' // permission OK but radio is off
  | 'unsupported';

let _bleManager: { state: () => Promise<string> } | null = null;

/**
 * Lazy-load BleManager so the metro bundle doesn't choke when the BLE
 * native module isn't included (Expo Go).
 */
async function getBleManager() {
  if (_bleManager) return _bleManager;
  try {
    const mod = await import('react-native-ble-plx');
    _bleManager = new mod.BleManager();
    return _bleManager;
  } catch {
    return null;
  }
}

export async function getBlePermissionStatus(): Promise<BlePermissionStatus> {
  if (Platform.OS === 'ios') return getIosStatus();
  if (Platform.OS === 'android') return getAndroidStatus();
  return 'unsupported';
}

/**
 * Trigger the OS permission prompt(s). Returns the resulting status.
 */
export async function requestBlePermissions(): Promise<BlePermissionStatus> {
  if (Platform.OS === 'ios') {
    // iOS auto-prompts the first time we instantiate BleManager. Just read state.
    await getBleManager();
    return getIosStatus();
  }
  if (Platform.OS === 'android') {
    return requestAndroidPermissions();
  }
  return 'unsupported';
}

/**
 * Open the system Settings page for this app. Used by the
 * "Bluetooth required" interstitial when the user has blocked the permission.
 */
export async function openAppSettings(): Promise<void> {
  if (Platform.OS === 'ios') {
    await Linking.openURL('app-settings:');
    return;
  }
  await Linking.openSettings();
}

async function getIosStatus(): Promise<BlePermissionStatus> {
  const manager = await getBleManager();
  if (!manager) return 'unsupported';
  try {
    const state = await manager.state();
    switch (state) {
      case 'PoweredOn':
        return 'granted';
      case 'Unauthorized':
        return 'blocked';
      case 'PoweredOff':
        return 'powered-off';
      case 'Unsupported':
        return 'unsupported';
      default:
        return 'denied';
    }
  } catch {
    return 'denied';
  }
}

async function getAndroidStatus(): Promise<BlePermissionStatus> {
  const apiLevel = Platform.Version;
  const needsNew = typeof apiLevel === 'number' && apiLevel >= 31;
  const perms = needsNew
    ? [
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]
    : [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];

  for (const p of perms) {
    const granted = await PermissionsAndroid.check(p);
    if (!granted) return 'denied';
  }
  return 'granted';
}

async function requestAndroidPermissions(): Promise<BlePermissionStatus> {
  const apiLevel = Platform.Version;
  const needsNew = typeof apiLevel === 'number' && apiLevel >= 31;
  const perms = needsNew
    ? [
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]
    : [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];

  const result = await PermissionsAndroid.requestMultiple(perms);
  const denied = perms.some(
    (p) => result[p] === PermissionsAndroid.RESULTS.DENIED,
  );
  const blocked = perms.some(
    (p) => result[p] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
  );
  if (blocked) return 'blocked';
  if (denied) return 'denied';
  return 'granted';
}
