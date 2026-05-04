import Realm from 'realm';

import { SYNC_META_PROPERTIES } from './sync-meta';

export class BootSchema extends Realm.Object<BootSchema> {
  id!: string;
  organizationId!: string;
  serial!: string;
  name?: string;
  model?: string;
  firmware?: string;
  defaultHorseId?: string;
  lastBatteryPct?: number;
  lastSeenAt?: Date;
  archivedAt?: Date;
  createdAt!: Date;

  serverVersion!: number;
  localDirty!: boolean;
  pendingDelete!: boolean;
  lastSyncedAt?: Date;

  static schema: Realm.ObjectSchema = {
    name: 'Boot',
    primaryKey: 'id',
    properties: {
      ...SYNC_META_PROPERTIES,
      organizationId: { type: 'string', indexed: true },
      serial: { type: 'string', indexed: true },
      name: 'string?',
      model: 'string?',
      firmware: 'string?',
      defaultHorseId: 'string?',
      lastBatteryPct: 'int?',
      lastSeenAt: 'date?',
      archivedAt: 'date?',
      createdAt: 'date',
    },
  };
}
