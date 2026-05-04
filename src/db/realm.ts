/**
 * realm.ts — opens (and memoizes) the on-device Realm.
 *
 * Realm requires a native module — Expo Go cannot bundle it. The dev
 * client + EAS development profile (T0.05) do include it. To keep
 * `pnpm test` running in node we lazy-import the realm package and
 * surface a clear error if the caller is on a build that doesn't ship
 * the native binding.
 *
 * Schema versioning + migrations: bump REALM_SCHEMA_VERSION in
 * src/db/schemas/index.ts and add a migration step here. v1 is the
 * initial Phase 1 shape; no migrations defined yet.
 */

import { v7 as uuidv7 } from 'uuid';

import { REALM_SCHEMA_VERSION, REALM_SCHEMAS } from './schemas';

let _instance: unknown = null;
let _opening: Promise<unknown> | null = null;

/**
 * Open Realm. Idempotent — repeated calls return the same instance.
 * Throws when the native module isn't available (e.g. Expo Go).
 */
export async function getRealm(): Promise<RealmLike> {
  if (_instance) return _instance as RealmLike;
  if (_opening) return _opening as Promise<RealmLike>;
  _opening = openRealm();
  try {
    _instance = await _opening;
    return _instance as RealmLike;
  } finally {
    _opening = null;
  }
}

async function openRealm(): Promise<RealmLike> {
  const Realm = (await import('realm')).default;
  return Realm.open({
    path: 'bsure.realm',
    schema: REALM_SCHEMAS as unknown as Realm.ObjectClass[],
    schemaVersion: REALM_SCHEMA_VERSION,
    onMigration: (_oldRealm, _newRealm) => {
      // No migrations yet. When schemas change shape, copy data here from
      // _oldRealm into _newRealm.
    },
  }) as Promise<RealmLike>;
}

/** Closes + releases the Realm singleton. Used by tests + sign-out. */
export async function closeRealm(): Promise<void> {
  if (_instance && typeof (_instance as RealmLike).close === 'function') {
    (_instance as RealmLike).close();
  }
  _instance = null;
  _opening = null;
}

/**
 * UUIDv7 generator used by every repository when minting a new local id.
 * v7 is monotonic (timestamp-prefixed) which gives nice ordering when
 * the API also uses v7 ids — see ADR 0009 / spec.md scan write contract.
 */
export function newId(): string {
  return uuidv7();
}

/** Minimal subset of the realm.Realm surface our repositories use. */
export type RealmLike = {
  write: <T>(fn: () => T) => T;
  create: (
    schemaName: string,
    values: Record<string, unknown>,
    mode?: string,
  ) => unknown;
  objectForPrimaryKey: (schemaName: string, key: unknown) => unknown;
  objects: (schemaName: string) => unknown;
  delete: (object: unknown) => void;
  close: () => void;
};
