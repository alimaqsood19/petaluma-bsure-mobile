/**
 * boots.ts — repository for the Boot Realm collection.
 *
 * Phase 1: register, list, rename, set default horse.
 * Multi-boot adjacency (T1.21) reads from listBoots(orgId).
 */

import { getRealm, newId } from '../realm';
import { BootSchema } from '../schemas';

export type BootInput = {
  organizationId: string;
  serial: string;
  name?: string;
  model?: string;
  firmware?: string;
  lastBatteryPct?: number;
};

export async function createBoot(input: BootInput): Promise<string> {
  const realm = await getRealm();
  const id = newId();
  const now = new Date();
  realm.write(() => {
    realm.create(BootSchema.schema.name, {
      id,
      ...input,
      lastSeenAt: now,
      createdAt: now,
      serverVersion: 0,
      localDirty: true,
      pendingDelete: false,
    });
  });
  return id;
}

export async function listBoots(organizationId: string): Promise<unknown[]> {
  const realm = await getRealm();
  const all = realm.objects(BootSchema.schema.name) as {
    filtered: (q: string, ...args: unknown[]) => unknown[];
  };
  return Array.from(
    all.filtered(
      'organizationId == $0 AND archivedAt == null AND pendingDelete == false',
      organizationId,
    ),
  );
}

export async function findBootBySerial(
  serial: string,
): Promise<unknown | null> {
  const realm = await getRealm();
  const all = realm.objects(BootSchema.schema.name) as {
    filtered: (q: string, ...args: unknown[]) => unknown[];
  };
  const matches = Array.from(all.filtered('serial == $0', serial));
  return matches[0] ?? null;
}

export async function renameBoot(id: string, name: string): Promise<void> {
  const realm = await getRealm();
  realm.write(() => {
    const existing = realm.objectForPrimaryKey(BootSchema.schema.name, id);
    if (!existing) return;
    Object.assign(existing as Record<string, unknown>, {
      name,
      localDirty: true,
    });
  });
}

export async function setDefaultHorse(
  bootId: string,
  horseId: string | null,
): Promise<void> {
  const realm = await getRealm();
  realm.write(() => {
    const existing = realm.objectForPrimaryKey(BootSchema.schema.name, bootId);
    if (!existing) return;
    Object.assign(existing as Record<string, unknown>, {
      defaultHorseId: horseId ?? undefined,
      localDirty: true,
    });
  });
}
