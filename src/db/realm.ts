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
 * UUIDv7-shaped client ID. Time-prefixed (sortable) + Math.random() suffix.
 * We don't need cryptographic randomness on the device — these are local
 * identifiers used as the API's `clientId` for idempotency on write. The
 * crypto-quality v4/v7 generator from `uuid` requires a native module
 * (`react-native-get-random-values`) which adds linker friction; this
 * version produces a v7-formatted hex string with the same ordering
 * properties without any native dependency.
 *
 * Format: 8-4-4-4-12 hex (UUID), version nibble = 7, variant nibble = 8/9/a/b.
 */
export function newId(): string {
  const ts = Date.now();
  // 48-bit big-endian timestamp → first 12 hex chars
  const tsHex = ts.toString(16).padStart(12, '0').slice(-12);
  const part1 = tsHex.slice(0, 8); // time_high
  const part2 = tsHex.slice(8, 12); // time_low
  const rand = (n: number): string =>
    Math.floor(Math.random() * 16 ** n)
      .toString(16)
      .padStart(n, '0');
  // version 7
  const part3 = `7${rand(3)}`;
  // variant 10xx → leading nibble 8/9/a/b
  const variantNibble = (8 + Math.floor(Math.random() * 4)).toString(16);
  const part4 = `${variantNibble}${rand(3)}`;
  const part5 = rand(12);
  return `${part1}-${part2}-${part3}-${part4}-${part5}`;
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
