import Realm from 'realm';

import { SYNC_META_PROPERTIES } from './sync-meta';

export class UserSchema extends Realm.Object<UserSchema> {
  id!: string;
  cognitoSub!: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;

  // Preferences mirror plan.md § 5.1 — clients update locally and PATCH /v1/me.
  prefsTempUnit!: string;
  prefsHeightUnit!: string;
  prefsWeightUnit!: string;
  prefsTheme!: string;

  serverVersion!: number;
  localDirty!: boolean;
  pendingDelete!: boolean;
  lastSyncedAt?: Date;

  static schema: Realm.ObjectSchema = {
    name: 'User',
    primaryKey: 'id',
    properties: {
      ...SYNC_META_PROPERTIES,
      cognitoSub: 'string',
      email: 'string?',
      firstName: 'string?',
      lastName: 'string?',
      role: 'string?',
      prefsTempUnit: { type: 'string', default: 'F' },
      prefsHeightUnit: { type: 'string', default: 'hands' },
      prefsWeightUnit: { type: 'string', default: 'lbs' },
      prefsTheme: { type: 'string', default: 'system' },
    },
  };
}
