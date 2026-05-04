import Realm from 'realm';

import { SYNC_META_PROPERTIES } from './sync-meta';

export type Leg = 'FL' | 'FR' | 'BL' | 'BR';

/**
 * Per-sensor reading captured from the Smart Boot. ADR 0009 fixes the
 * payload to 184 floats in fixed sensor order. Embedded in the Scan
 * record so the offline scan record is self-contained — once synced,
 * the canonical time-series lives in the API's TimescaleDB hypertable
 * (see plan.md § 5.2). Old scans on the device drop the embedded
 * readings via LRU once we exceed 200 MB local cache (plan.md § 3.5);
 * the summary count + leg/region info stays for UI rendering.
 */
export class SensorReadingSchema extends Realm.Object<SensorReadingSchema> {
  sensorIndex!: number;
  region!: string;
  tempF!: number;

  static schema: Realm.ObjectSchema = {
    name: 'SensorReading',
    embedded: true,
    properties: {
      sensorIndex: 'int',
      region: 'string',
      tempF: 'float',
    },
  };
}

export class ScanSchema extends Realm.Object<ScanSchema> {
  id!: string;
  /** UUIDv7 generated on the device — used as the API's clientId for idempotency. */
  clientId!: string;
  horseId?: string;
  unassigned!: boolean;
  organizationId!: string;
  bootId?: string;
  capturedByUserId!: string;
  leg!: Leg;
  capturedAt!: Date;
  syncedAt?: Date;
  activityType?: string;
  intensity?: number;
  durationMinutes?: number;
  footing?: string;
  notes?: string;
  isStudyMode!: boolean;
  archivedAt?: Date;
  readings!: Realm.List<SensorReadingSchema>;

  serverVersion!: number;
  localDirty!: boolean;
  pendingDelete!: boolean;
  lastSyncedAt?: Date;

  static schema: Realm.ObjectSchema = {
    name: 'Scan',
    primaryKey: 'id',
    properties: {
      ...SYNC_META_PROPERTIES,
      clientId: { type: 'string', indexed: true },
      horseId: { type: 'string', indexed: true, optional: true },
      unassigned: { type: 'bool', default: false },
      organizationId: { type: 'string', indexed: true },
      bootId: 'string?',
      capturedByUserId: 'string',
      leg: 'string',
      capturedAt: { type: 'date', indexed: true },
      syncedAt: 'date?',
      activityType: 'string?',
      intensity: 'double?',
      durationMinutes: 'int?',
      footing: 'string?',
      notes: 'string?',
      isStudyMode: { type: 'bool', default: false },
      archivedAt: 'date?',
      readings: { type: 'list', objectType: 'SensorReading' },
    },
  };
}
