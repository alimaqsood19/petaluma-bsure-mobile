/**
 * Horse list store — Zustand-backed cache of the Realm collection.
 *
 * Phase 1 simple model: read all horses for the active org and keep them
 * in memory; refresh() re-queries on demand (focus events, after a save).
 * Realm's reactive query observers are a Phase 2 polish — they need
 * @realm/react which we'll pick up alongside the design-system refit.
 */

import { create } from 'zustand';

import { listHorses as listHorsesRepo } from '@/db/repositories/horses';

export type HorseRecord = {
  id: string;
  organizationId: string;
  name: string;
  breed?: string;
  heightHands?: number;
  weightLbs?: number;
  age?: number;
  sex?: string;
  color?: string;
  uniqueMarkings?: string;
  discipline?: string;
  ownerName?: string;
  trainerName?: string;
  contactInfo?: string;
  photoUrl?: string;
  archivedAt?: Date;
  createdAt: Date;
  serverVersion: number;
  localDirty: boolean;
  lastSyncedAt?: Date;
};

type HorseStoreState = {
  horses: HorseRecord[];
  loading: boolean;
  error: string | null;
  refresh: (organizationId: string) => Promise<void>;
};

export const useHorseStore = create<HorseStoreState>((set) => ({
  horses: [],
  loading: false,
  error: null,
  refresh: async (organizationId) => {
    set({ loading: true, error: null });
    try {
      const records = await listHorsesRepo(organizationId);
      set({
        loading: false,
        horses: records.map(toRecord),
      });
    } catch (e) {
      set({
        loading: false,
        error:
          e instanceof Error
            ? e.message
            : 'Could not load horses from local storage.',
      });
    }
  },
}));

function toRecord(raw: unknown): HorseRecord {
  const r = raw as Record<string, unknown>;
  return {
    id: String(r.id),
    organizationId: String(r.organizationId),
    name: String(r.name ?? ''),
    breed: optionalString(r.breed),
    heightHands: optionalNumber(r.heightHands),
    weightLbs: optionalNumber(r.weightLbs),
    age: optionalNumber(r.age),
    sex: optionalString(r.sex),
    color: optionalString(r.color),
    uniqueMarkings: optionalString(r.uniqueMarkings),
    discipline: optionalString(r.discipline),
    ownerName: optionalString(r.ownerName),
    trainerName: optionalString(r.trainerName),
    contactInfo: optionalString(r.contactInfo),
    photoUrl: optionalString(r.photoUrl),
    archivedAt: r.archivedAt instanceof Date ? r.archivedAt : undefined,
    createdAt: r.createdAt instanceof Date ? r.createdAt : new Date(),
    serverVersion: Number(r.serverVersion ?? 0),
    localDirty: Boolean(r.localDirty),
    lastSyncedAt: r.lastSyncedAt instanceof Date ? r.lastSyncedAt : undefined,
  };
}

function optionalString(v: unknown): string | undefined {
  if (typeof v === 'string' && v.length > 0) return v;
  return undefined;
}

function optionalNumber(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  return undefined;
}
