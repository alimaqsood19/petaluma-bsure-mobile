import { describe, expect, it } from '@jest/globals';

import { profileCompletionPct } from '@/horses/profile-completion';

describe('profileCompletionPct', () => {
  it('returns 0 for an empty snapshot', () => {
    expect(
      profileCompletionPct({
        name: null,
        breed: null,
        heightHands: null,
        weightLbs: null,
        age: null,
        sex: null,
        color: null,
        uniqueMarkings: null,
        discipline: null,
        ownerName: null,
        trainerName: null,
        contactInfo: null,
        photoUrl: null,
      }),
    ).toBe(0);
  });

  it('returns 100 when every weighted field is present', () => {
    expect(
      profileCompletionPct({
        name: 'Buttercup',
        breed: 'Warmblood',
        heightHands: 16.2,
        weightLbs: 1100,
        age: 12,
        sex: 'mare',
        color: 'bay',
        uniqueMarkings: 'star',
        discipline: 'jumping',
        ownerName: 'Sarah',
        trainerName: 'Marcus',
        contactInfo: 'sarah@example.com',
        photoUrl: 'https://...',
      }),
    ).toBe(100);
  });

  it('weights name + people heavier than minor fields', () => {
    const minimal = profileCompletionPct({
      name: 'Buttercup',
      breed: null,
      heightHands: null,
      weightLbs: null,
      age: null,
      sex: null,
      color: null,
      uniqueMarkings: null,
      discipline: null,
      ownerName: null,
      trainerName: null,
      contactInfo: null,
      photoUrl: null,
    });
    // name carries 15/100 of the total weight.
    expect(minimal).toBeGreaterThanOrEqual(15);
    expect(minimal).toBeLessThan(20);
  });

  it('treats empty strings as missing', () => {
    expect(
      profileCompletionPct({
        name: '',
        breed: '   ',
        heightHands: null,
        weightLbs: null,
        age: null,
        sex: null,
        color: null,
        uniqueMarkings: null,
        discipline: null,
        ownerName: null,
        trainerName: null,
        contactInfo: null,
        photoUrl: null,
      }),
    ).toBe(0);
  });
});
