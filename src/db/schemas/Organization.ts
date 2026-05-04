import Realm from 'realm';

import { SYNC_META_PROPERTIES } from './sync-meta';

export class OrganizationSchema extends Realm.Object<OrganizationSchema> {
  id!: string;
  name!: string;
  ownerUserId!: string;
  discipline?: string;
  isPersonal!: boolean;

  serverVersion!: number;
  localDirty!: boolean;
  pendingDelete!: boolean;
  lastSyncedAt?: Date;

  static schema: Realm.ObjectSchema = {
    name: 'Organization',
    primaryKey: 'id',
    properties: {
      ...SYNC_META_PROPERTIES,
      name: 'string',
      ownerUserId: 'string',
      discipline: 'string?',
      isPersonal: { type: 'bool', default: false },
    },
  };
}
