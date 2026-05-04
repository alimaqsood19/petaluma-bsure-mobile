import Realm from 'realm';

import { SYNC_META_PROPERTIES } from './sync-meta';

/**
 * Activity context attached to a scan or recorded standalone (post-ride
 * notes without a scan). Lives in its own collection rather than embedded
 * because Phase 2 surfaces want to filter / aggregate scans by activity
 * type (see F7.5 filters modal).
 */
export class ActivitySchema extends Realm.Object<ActivitySchema> {
  id!: string;
  organizationId!: string;
  horseId!: string;
  capturedAt!: Date;
  activityType!: string;
  intensity?: number;
  durationMinutes?: number;
  footing?: string;
  notes?: string;
  capturedByUserId!: string;

  serverVersion!: number;
  localDirty!: boolean;
  pendingDelete!: boolean;
  lastSyncedAt?: Date;

  static schema: Realm.ObjectSchema = {
    name: 'Activity',
    primaryKey: 'id',
    properties: {
      ...SYNC_META_PROPERTIES,
      organizationId: { type: 'string', indexed: true },
      horseId: { type: 'string', indexed: true },
      capturedAt: { type: 'date', indexed: true },
      activityType: 'string',
      intensity: 'double?',
      durationMinutes: 'int?',
      footing: 'string?',
      notes: 'string?',
      capturedByUserId: 'string',
    },
  };
}
