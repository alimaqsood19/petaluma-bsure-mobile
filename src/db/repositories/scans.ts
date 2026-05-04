/**
 * Realm repository for scans. The scan record is the local-first source
 * of truth during capture (E1 — local-first); once synced, the canonical
 * 184-row time-series lives in TimescaleDB on the API side.
 */

import { getRealm, newId } from '../realm';
import { ScanSchema, type Leg } from '../schemas';

export type ScanReading = {
  sensorIndex: number;
  region: string;
  tempF: number;
};

export type ScanCreateInput = {
  clientId?: string;
  horseId: string | null;
  organizationId: string;
  bootId?: string | null;
  capturedByUserId: string;
  leg: Leg;
  capturedAt: Date;
  activityType?: string;
  intensity?: number;
  durationMinutes?: number;
  footing?: string;
  notes?: string;
  isStudyMode?: boolean;
  unassigned?: boolean;
  readings: ScanReading[];
};

export async function createScan(input: ScanCreateInput): Promise<string> {
  const realm = await getRealm();
  const id = newId();
  const clientId = input.clientId ?? newId();
  realm.write(() => {
    realm.create(ScanSchema.schema.name, {
      id,
      clientId,
      horseId: input.horseId ?? undefined,
      unassigned: !!input.unassigned || input.horseId === null,
      organizationId: input.organizationId,
      bootId: input.bootId ?? undefined,
      capturedByUserId: input.capturedByUserId,
      leg: input.leg,
      capturedAt: input.capturedAt,
      activityType: input.activityType,
      intensity: input.intensity,
      durationMinutes: input.durationMinutes,
      footing: input.footing,
      notes: input.notes,
      isStudyMode: !!input.isStudyMode,
      readings: input.readings,
      serverVersion: 0,
      localDirty: true,
      pendingDelete: false,
    });
  });
  return id;
}

export async function listUnsyncedScans(
  organizationId: string,
): Promise<unknown[]> {
  const realm = await getRealm();
  const all = realm.objects(ScanSchema.schema.name) as {
    filtered: (q: string, ...args: unknown[]) => unknown[];
  };
  return Array.from(
    all.filtered(
      'organizationId == $0 AND localDirty == true AND pendingDelete == false',
      organizationId,
    ),
  );
}

export async function listUnassignedScans(
  organizationId: string,
): Promise<unknown[]> {
  const realm = await getRealm();
  const all = realm.objects(ScanSchema.schema.name) as {
    filtered: (q: string, ...args: unknown[]) => unknown[];
  };
  return Array.from(
    all.filtered(
      'organizationId == $0 AND unassigned == true AND pendingDelete == false',
      organizationId,
    ),
  );
}

export async function assignScanToHorse(
  scanId: string,
  horseId: string,
): Promise<void> {
  const realm = await getRealm();
  realm.write(() => {
    const existing = realm.objectForPrimaryKey(ScanSchema.schema.name, scanId);
    if (!existing) return;
    Object.assign(existing as Record<string, unknown>, {
      horseId,
      unassigned: false,
      localDirty: true,
    });
  });
}
