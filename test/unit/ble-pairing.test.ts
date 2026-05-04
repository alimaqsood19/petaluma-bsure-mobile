import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('react-native-ble-plx', () => ({
  BleManager: jest.fn(() => ({
    startDeviceScan: jest.fn(),
    stopDeviceScan: jest.fn(),
    state: jest.fn(),
    connectToDevice: jest.fn(),
  })),
}));

import * as BlePlx from 'react-native-ble-plx';

import { usePairingStore } from '@/ble/pairing';

const startDeviceScan = jest.fn();
const stopDeviceScan = jest.fn();
const stateFn = jest.fn();
const connectToDevice = jest.fn();

beforeEach(() => {
  startDeviceScan.mockReset();
  stopDeviceScan.mockReset();
  stateFn.mockReset();
  connectToDevice.mockReset();
  (BlePlx.BleManager as unknown as jest.Mock).mockImplementation(() => ({
    startDeviceScan,
    stopDeviceScan,
    state: stateFn,
    connectToDevice,
  }));
  usePairingStore.setState({
    phase: 'idle',
    discovered: [],
    selectedDeviceId: null,
    connectedMeta: null,
    error: null,
  });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('Pairing state machine', () => {
  it('startScan moves phase to scanning and registers a discovered listener', async () => {
    await usePairingStore.getState().startScan();
    expect(usePairingStore.getState().phase).toBe('scanning');
    expect(startDeviceScan).toHaveBeenCalledTimes(1);
    const args = startDeviceScan.mock.calls[0] as unknown[];
    expect(args[0]).toEqual(['1e265423-3373-42ea-bb00-e47296c400a9']);
  });

  it('discovered listener pushes unique devices and flips to discovered phase', async () => {
    await usePairingStore.getState().startScan();
    const listener = (startDeviceScan.mock.calls[0] as unknown[])[2] as (
      err: unknown,
      device: any,
    ) => void;
    listener(null, { id: 'd1', name: 'Boot A', rssi: -55 });
    listener(null, { id: 'd1', name: 'Boot A', rssi: -50 }); // duplicate
    listener(null, { id: 'd2', name: 'Boot B', rssi: -70 });
    const s = usePairingStore.getState();
    expect(s.phase).toBe('discovered');
    expect(s.discovered.map((b) => b.deviceId)).toEqual(['d1', 'd2']);
  });

  it('setError flips to error phase and stops the scan', async () => {
    await usePairingStore.getState().startScan();
    await usePairingStore.getState().setError({
      code: 'connection-failed',
      message: 'boom',
    });
    const s = usePairingStore.getState();
    expect(s.phase).toBe('error');
    expect(s.error?.code).toBe('connection-failed');
    expect(stopDeviceScan).toHaveBeenCalled();
  });

  it('reset clears state back to idle', async () => {
    await usePairingStore.getState().startScan();
    await usePairingStore.getState().reset();
    const s = usePairingStore.getState();
    expect(s.phase).toBe('idle');
    expect(s.discovered).toEqual([]);
    expect(s.error).toBeNull();
  });

  it('selectAndConnect surfaces connection-failed when the device throws', async () => {
    (connectToDevice as any).mockRejectedValue(new Error('out of range'));
    await usePairingStore.getState().selectAndConnect('d1');
    const s = usePairingStore.getState();
    expect(s.error?.code).toBe('connection-failed');
    expect(s.error?.message).toContain('out of range');
  });
});
