import { describe, expect, it } from '@jest/globals';

import { fakePayload, readingsFromFloats } from '@/scans/decode';
import { regionFor, REGION_RANGES } from '@/scans/regions';

describe('regionFor', () => {
  it('matches the documented sensor → region map (plan.md § 5.3)', () => {
    expect(regionFor(0)).toBe('hoof_band');
    expect(regionFor(15)).toBe('hoof_band');
    expect(regionFor(16)).toBe('fetlock');
    expect(regionFor(47)).toBe('fetlock');
    expect(regionFor(48)).toBe('cannon');
    expect(regionFor(103)).toBe('cannon');
    expect(regionFor(104)).toBe('tendon');
    expect(regionFor(151)).toBe('tendon');
    expect(regionFor(152)).toBe('knee');
    expect(regionFor(183)).toBe('knee');
  });

  it('REGION_RANGES covers exactly 0..183 with no gaps or overlaps', () => {
    let cursor = 0;
    for (const r of REGION_RANGES) {
      expect(r.start).toBe(cursor);
      cursor = r.end + 1;
    }
    expect(cursor).toBe(184);
  });
});

describe('readingsFromFloats', () => {
  it('produces 184 readings with the correct sensorIndex + region', () => {
    const out = readingsFromFloats(fakePayload());
    expect(out.length).toBe(184);
    expect(out[0]?.sensorIndex).toBe(0);
    expect(out[0]?.region).toBe('hoof_band');
    expect(out[183]?.sensorIndex).toBe(183);
    expect(out[183]?.region).toBe('knee');
    expect(typeof out[42]?.tempF).toBe('number');
  });

  it('throws when the payload size disagrees with ADR 0009', () => {
    expect(() => readingsFromFloats(new Float32Array(100))).toThrow(/firmware/);
  });
});
