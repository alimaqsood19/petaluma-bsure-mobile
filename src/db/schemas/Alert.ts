import Realm from 'realm';

import { SYNC_META_PROPERTIES } from './sync-meta';

export type AlertType = 'BASELINE_DEVIATION' | 'ASYMMETRY' | 'HOTSPOT';

export class AlertSchema extends Realm.Object<AlertSchema> {
  id!: string;
  organizationId!: string;
  horseId!: string;
  scanId!: string;
  type!: AlertType;
  severity!: string;
  region?: string;
  leg?: string;
  copy!: string;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  createdAt!: Date;

  serverVersion!: number;
  localDirty!: boolean;
  pendingDelete!: boolean;
  lastSyncedAt?: Date;

  static schema: Realm.ObjectSchema = {
    name: 'Alert',
    primaryKey: 'id',
    properties: {
      ...SYNC_META_PROPERTIES,
      organizationId: { type: 'string', indexed: true },
      horseId: { type: 'string', indexed: true },
      scanId: { type: 'string', indexed: true },
      type: 'string',
      severity: 'string',
      region: 'string?',
      leg: 'string?',
      copy: 'string',
      acknowledgedAt: 'date?',
      acknowledgedBy: 'string?',
      createdAt: { type: 'date', indexed: true },
    },
  };
}
