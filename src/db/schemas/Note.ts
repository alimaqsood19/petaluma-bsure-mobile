import Realm from 'realm';

import { SYNC_META_PROPERTIES } from './sync-meta';

/**
 * Per-scan or per-region pinned annotation. Edit conflicts are
 * last-write-wins for free-text fields (per plan.md § 3.4).
 */
export class NoteSchema extends Realm.Object<NoteSchema> {
  id!: string;
  organizationId!: string;
  horseId!: string;
  scanId?: string;
  /** When pinned to a region: e.g., "cannon", "tendon", or null for whole-scan. */
  region?: string;
  authorUserId!: string;
  body!: string;
  createdAt!: Date;
  editedAt?: Date;

  serverVersion!: number;
  localDirty!: boolean;
  pendingDelete!: boolean;
  lastSyncedAt?: Date;

  static schema: Realm.ObjectSchema = {
    name: 'Note',
    primaryKey: 'id',
    properties: {
      ...SYNC_META_PROPERTIES,
      organizationId: { type: 'string', indexed: true },
      horseId: { type: 'string', indexed: true },
      scanId: { type: 'string', indexed: true, optional: true },
      region: 'string?',
      authorUserId: 'string',
      body: 'string',
      createdAt: { type: 'date', indexed: true },
      editedAt: 'date?',
    },
  };
}
