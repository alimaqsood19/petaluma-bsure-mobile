import { describe, expect, it } from '@jest/globals';

import {
  type InRangeBoot,
  mergeAdjacency,
  pruneStale,
} from '@/ble/adjacency';

describe('pruneStale', () => {
  it('drops entries older than the TTL', () => {
    const now = 100_000;
    const list: InRangeBoot[] = [
      { deviceId: 'a', advertisedName: 'A', rssi: -60, lastSeenAt: now - 1_000 },
      { deviceId: 'b', advertisedName: 'B', rssi: -70, lastSeenAt: now - 9_000 },
    ];
    expect(pruneStale(list, now).map((b) => b.deviceId)).toEqual(['a']);
  });
});

describe('mergeAdjacency', () => {
  const paired = [
    { id: 'p1', serial: 'SN-AAA', name: 'Boot Alpha' },
    { id: 'p2', serial: 'SN-BBB', name: 'Boot Beta' },
  ];

  it('marks a paired boot as in range when its serial is in the advertised name', () => {
    const result = mergeAdjacency(
      paired,
      [
        {
          deviceId: 'd1',
          advertisedName: 'SN-AAA',
          rssi: -55,
          lastSeenAt: Date.now(),
        },
      ],
    );
    expect(result.find((e) => e.paired.id === 'p1')?.inRange).toBe(true);
    expect(result.find((e) => e.paired.id === 'p2')?.inRange).toBe(false);
  });

  it('sorts in-range before out-of-range, then by RSSI desc', () => {
    const now = Date.now();
    const result = mergeAdjacency(
      paired,
      [
        { deviceId: 'd2', advertisedName: 'SN-BBB', rssi: -45, lastSeenAt: now },
        { deviceId: 'd1', advertisedName: 'SN-AAA', rssi: -75, lastSeenAt: now },
      ],
    );
    expect(result.map((e) => e.paired.id)).toEqual(['p2', 'p1']);
  });
});
