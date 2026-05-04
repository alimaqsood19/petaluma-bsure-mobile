/**
 * Sync metadata fields shared by every synced Realm schema.
 *
 * Per `plan.md § 3.2`:
 *  - `id`: server UUID once synced; locally generated UUIDv7 before first sync.
 *    Stored as `string` on Realm (Realm does have `uuid` but a stringified
 *    representation keeps parity with the API which uses string UUIDs).
 *  - `serverVersion`: integer monotonic version returned by API. 0 before
 *    first sync.
 *  - `localDirty`: true if there are unsynced edits.
 *  - `pendingDelete`: tombstone flag — record is hidden from UI but kept
 *    on disk until the server confirms the delete (E2 — append-only).
 *  - `lastSyncedAt`: epoch ms of the last successful pull/push round-trip
 *    that touched this record. `null` until first sync.
 */
export const SYNC_META_PROPERTIES = {
  id: 'string',
  serverVersion: { type: 'int', default: 0 },
  localDirty: { type: 'bool', default: true },
  pendingDelete: { type: 'bool', default: false },
  lastSyncedAt: 'date?',
} as const;
