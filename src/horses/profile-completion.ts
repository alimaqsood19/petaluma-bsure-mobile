/**
 * Horse profile completion percentage per F3.3.
 *
 * Pure function so it can be tested without Realm. The spec says
 * "nothing is required beyond name + barn" — those satisfy the
 * minimum baseline (the form gates Save on those two). Profile
 * completeness is a UX nudge to keep filling in the rest.
 */

export type ProfileSnapshot = {
  name?: string | null;
  breed?: string | null;
  heightHands?: number | null;
  weightLbs?: number | null;
  age?: number | null;
  sex?: string | null;
  color?: string | null;
  uniqueMarkings?: string | null;
  discipline?: string | null;
  ownerName?: string | null;
  trainerName?: string | null;
  contactInfo?: string | null;
  photoUrl?: string | null;
};

const FIELD_WEIGHTS: Array<[keyof ProfileSnapshot, number]> = [
  ['name', 15],
  ['breed', 7],
  ['heightHands', 7],
  ['weightLbs', 7],
  ['age', 7],
  ['sex', 7],
  ['color', 7],
  ['uniqueMarkings', 5],
  ['discipline', 8],
  ['ownerName', 8],
  ['trainerName', 8],
  ['contactInfo', 7],
  ['photoUrl', 7],
];

export function profileCompletionPct(snapshot: ProfileSnapshot): number {
  let total = 0;
  let earned = 0;
  for (const [key, weight] of FIELD_WEIGHTS) {
    total += weight;
    const v = snapshot[key];
    if (typeof v === 'string' && v.trim().length > 0) earned += weight;
    else if (typeof v === 'number') earned += weight;
  }
  if (total === 0) return 0;
  return Math.round((earned / total) * 100);
}
