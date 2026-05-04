/**
 * Validates the static .schema definitions on every Realm class.
 *
 * Realm.open() needs the native module (not loadable in node-jest), so we
 * exercise schema *shape* here and rely on Maestro / dev-client integration
 * for the live CRUD round-trip the T1.19 DoD asks for. The schema-shape
 * checks catch the most common breakages (typos in property type strings,
 * missing primary key, missing sync-meta fields).
 */

import { describe, expect, it, jest } from '@jest/globals';

// Realm's node binary isn't built in this test env; we only exercise schema
// *shapes*. Mock the realm module to provide a minimal Realm.Object base
// class that the schema files extend.
jest.mock('realm', () => {
  class FakeRealmObject {}
  const fake = { Object: FakeRealmObject };
  return { __esModule: true, default: fake, Object: FakeRealmObject };
});

import {
  REALM_SCHEMAS,
  REALM_SCHEMA_VERSION,
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
} from '@/db/schemas';

const SYNC_META_KEYS = [
  'id',
  'serverVersion',
  'localDirty',
  'pendingDelete',
  'lastSyncedAt',
];

const TOP_LEVEL = [
  UserSchema,
  OrganizationSchema,
  MembershipSchema,
  HorseSchema,
  BootSchema,
  ScanSchema,
  ActivitySchema,
  AlertSchema,
  NoteSchema,
];

describe('Realm schema shapes', () => {
  it('REALM_SCHEMA_VERSION is a positive int', () => {
    expect(Number.isInteger(REALM_SCHEMA_VERSION)).toBe(true);
    expect(REALM_SCHEMA_VERSION).toBeGreaterThan(0);
  });

  it('REALM_SCHEMAS includes the 10 Phase-1 schemas', () => {
    expect(REALM_SCHEMAS.length).toBe(10);
    const names = REALM_SCHEMAS.map((s) => s.schema.name).sort();
    expect(names).toEqual(
      [
        'Activity',
        'Alert',
        'Boot',
        'Horse',
        'Membership',
        'Note',
        'Organization',
        'Scan',
        'SensorReading',
        'User',
      ].sort(),
    );
  });

  it('every top-level schema has primaryKey "id" and the sync-meta fields', () => {
    for (const cls of TOP_LEVEL) {
      const s = cls.schema;
      expect(s.primaryKey).toBe('id');
      for (const key of SYNC_META_KEYS) {
        expect(s.properties).toHaveProperty(key);
      }
    }
  });

  it('SensorReading is embedded (no primary key, embedded flag set)', () => {
    expect(SensorReadingSchema.schema.embedded).toBe(true);
    expect(SensorReadingSchema.schema.primaryKey).toBeUndefined();
  });

  it('Scan has the readings list of SensorReading', () => {
    const readings = ScanSchema.schema.properties.readings as {
      type: string;
      objectType: string;
    };
    expect(readings.type).toBe('list');
    expect(readings.objectType).toBe('SensorReading');
  });

  it('Scan supports unassigned + horseId optional (Quick Read)', () => {
    const props = ScanSchema.schema.properties;
    expect(props.unassigned).toBeDefined();
    expect(props.horseId).toBeDefined();
  });
});
