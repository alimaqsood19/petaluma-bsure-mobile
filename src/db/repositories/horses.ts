/**
 * horses.ts — minimal repository for the Horse Realm collection.
 *
 * Phase 1 surface (T1.19 + T1.22): create, get, list, update.
 * Archive (soft-delete via tombstone) lands with T1.22 + T1.25 sync.
 */

import { getRealm, newId, type RealmLike } from '../realm';
import { HorseSchema } from '../schemas';

export type HorseInput = {
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
};

export async function createHorse(input: HorseInput): Promise<string> {
  const realm = await getRealm();
  const id = newId();
  const now = new Date();
  realm.write(() => {
    realm.create(HorseSchema.schema.name, {
      id,
      ...input,
      createdAt: now,
      serverVersion: 0,
      localDirty: true,
      pendingDelete: false,
    });
  });
  return id;
}

export async function getHorse(id: string): Promise<unknown | null> {
  const realm = await getRealm();
  return realm.objectForPrimaryKey(HorseSchema.schema.name, id) ?? null;
}

export async function listHorses(organizationId: string): Promise<unknown[]> {
  const realm = await getRealm();
  return queryHorses(realm, organizationId);
}

export async function updateHorse(
  id: string,
  patch: Partial<HorseInput>,
): Promise<void> {
  const realm = await getRealm();
  realm.write(() => {
    const existing = realm.objectForPrimaryKey(HorseSchema.schema.name, id);
    if (!existing) return;
    Object.assign(existing as Record<string, unknown>, patch, {
      localDirty: true,
    });
  });
}

export async function archiveHorse(id: string): Promise<void> {
  const realm = await getRealm();
  realm.write(() => {
    const existing = realm.objectForPrimaryKey(HorseSchema.schema.name, id);
    if (!existing) return;
    Object.assign(existing as Record<string, unknown>, {
      archivedAt: new Date(),
      localDirty: true,
    });
  });
}

function queryHorses(realm: RealmLike, organizationId: string): unknown[] {
  const all = realm.objects(HorseSchema.schema.name) as {
    filtered: (q: string, ...args: unknown[]) => unknown[];
  };
  return Array.from(
    all.filtered(
      'organizationId == $0 AND archivedAt == null AND pendingDelete == false',
      organizationId,
    ),
  );
}
