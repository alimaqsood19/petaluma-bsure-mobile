import Realm from 'realm';

import { SYNC_META_PROPERTIES } from './sync-meta';

export type MembershipRole = 'OWNER' | 'TRAINER' | 'STAFF' | 'READ_ONLY';

export class MembershipSchema extends Realm.Object<MembershipSchema> {
  id!: string;
  userId!: string;
  organizationId!: string;
  role!: MembershipRole;
  invitedById?: string;
  acceptedAt?: Date;
  expiresAt?: Date;

  serverVersion!: number;
  localDirty!: boolean;
  pendingDelete!: boolean;
  lastSyncedAt?: Date;

  static schema: Realm.ObjectSchema = {
    name: 'Membership',
    primaryKey: 'id',
    properties: {
      ...SYNC_META_PROPERTIES,
      userId: { type: 'string', indexed: true },
      organizationId: { type: 'string', indexed: true },
      role: 'string',
      invitedById: 'string?',
      acceptedAt: 'date?',
      expiresAt: 'date?',
    },
  };
}
