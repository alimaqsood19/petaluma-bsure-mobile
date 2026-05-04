import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('react-native', () => ({
  Linking: {
    openSettings: jest.fn(),
    openURL: jest.fn(),
  },
  PermissionsAndroid: {
    PERMISSIONS: {
      BLUETOOTH_SCAN: 'android.permission.BLUETOOTH_SCAN',
      BLUETOOTH_CONNECT: 'android.permission.BLUETOOTH_CONNECT',
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
    },
    RESULTS: {
      GRANTED: 'granted',
      DENIED: 'denied',
      NEVER_ASK_AGAIN: 'never_ask_again',
    },
    check: jest.fn(),
    requestMultiple: jest.fn(),
  },
  Platform: { OS: 'ios', Version: 17 },
}));

jest.mock('react-native-ble-plx', () => ({
  BleManager: jest.fn(() => ({
    state: jest.fn(),
  })),
}));

import { Linking } from 'react-native';
import * as BlePlx from 'react-native-ble-plx';

import { openAppSettings, getBlePermissionStatus } from '@/ble/permissions';
import { useBleStore } from '@/ble/store';

const stateMock = jest.fn();

beforeEach(() => {
  (BlePlx.BleManager as unknown as jest.Mock).mockImplementation(() => ({
    state: stateMock,
  }));
});

afterEach(() => {
  stateMock.mockReset();
  (Linking.openSettings as unknown as jest.Mock).mockReset();
  (Linking.openURL as unknown as jest.Mock).mockReset();
  useBleStore.setState({ status: 'unknown', lastCheckedAt: null });
});

describe('iOS BLE permissions', () => {
  it('maps PoweredOn → granted', async () => {
    (stateMock as any).mockResolvedValue('PoweredOn');
    expect(await getBlePermissionStatus()).toBe('granted');
  });

  it('maps Unauthorized → blocked', async () => {
    (stateMock as any).mockResolvedValue('Unauthorized');
    expect(await getBlePermissionStatus()).toBe('blocked');
  });

  it('maps PoweredOff → powered-off', async () => {
    (stateMock as any).mockResolvedValue('PoweredOff');
    expect(await getBlePermissionStatus()).toBe('powered-off');
  });

  it('maps Unsupported → unsupported', async () => {
    (stateMock as any).mockResolvedValue('Unsupported');
    expect(await getBlePermissionStatus()).toBe('unsupported');
  });
});

describe('openAppSettings (iOS)', () => {
  it('opens app-settings: URL on iOS', async () => {
    await openAppSettings();
    expect(Linking.openURL).toHaveBeenCalledWith('app-settings:');
  });
});

describe('useBleStore', () => {
  it('refresh() sets status to the resolved value', async () => {
    (stateMock as any).mockResolvedValue('PoweredOn');
    const status = await useBleStore.getState().refresh();
    expect(status).toBe('granted');
    expect(useBleStore.getState().status).toBe('granted');
    expect(useBleStore.getState().lastCheckedAt).not.toBeNull();
  });
});
