import Realm from 'realm';

import { SYNC_META_PROPERTIES } from './sync-meta';

export class HorseSchema extends Realm.Object<HorseSchema> {
  id!: string;
  organizationId!: string;
  name!: string;
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
  archivedAt?: Date;
  createdAt!: Date;

  serverVersion!: number;
  localDirty!: boolean;
  pendingDelete!: boolean;
  lastSyncedAt?: Date;

  static schema: Realm.ObjectSchema = {
    name: 'Horse',
    primaryKey: 'id',
    properties: {
      ...SYNC_META_PROPERTIES,
      organizationId: { type: 'string', indexed: true },
      name: { type: 'string', indexed: true },
      breed: 'string?',
      heightHands: 'double?',
      weightLbs: 'double?',
      age: 'int?',
      sex: 'string?',
      color: 'string?',
      uniqueMarkings: 'string?',
      discipline: 'string?',
      ownerName: 'string?',
      trainerName: 'string?',
      contactInfo: 'string?',
      photoUrl: 'string?',
      archivedAt: 'date?',
      createdAt: 'date',
    },
  };
}
