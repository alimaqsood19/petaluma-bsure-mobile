/**
 * Realm schema barrel + the canonical schemas array used to open the DB.
 *
 * Schema versions: bump REALM_SCHEMA_VERSION whenever any property changes
 * shape. The migration callback (in db/realm.ts) will then run on next open.
 */

import { ActivitySchema } from './Activity';
import { AlertSchema } from './Alert';
import { BootSchema } from './Boot';
import { HorseSchema } from './Horse';
import { MembershipSchema } from './Membership';
import { NoteSchema } from './Note';
import { OrganizationSchema } from './Organization';
import { ScanSchema, SensorReadingSchema } from './Scan';
import { UserSchema } from './User';

export {
  ActivitySchema,
  AlertSchema,
  BootSchema,
  HorseSchema,
  MembershipSchema,
  NoteSchema,
  OrganizationSchema,
  ScanSchema,
  SensorReadingSchema,
  UserSchema,
};

export type { MembershipRole } from './Membership';
export type { AlertType } from './Alert';
export type { Leg } from './Scan';

export const REALM_SCHEMAS = [
  UserSchema,
  OrganizationSchema,
  MembershipSchema,
  HorseSchema,
  BootSchema,
  SensorReadingSchema,
  ScanSchema,
  ActivitySchema,
  AlertSchema,
  NoteSchema,
] as const;

/** Increment when any of the schemas above change shape. */
export const REALM_SCHEMA_VERSION = 1;
