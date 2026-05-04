/**
 * engine.ts — orchestrates outbound + inbound sync per plan.md § 3.4.
 *
 * Outbound:
 *  - Creates (serverVersion === 0): POST per-resource endpoint
 *      Horse  → POST /v1/horses
 *      Boot   → POST /v1/boots
 *      Scan   → POST /v1/scans (Idempotency-Key = clientId)
 *  - Edits (serverVersion > 0): batched POST /v1/sync/push
 *
 * Inbound:
 *  - POST /v1/sync/pull?since=<lastSyncedAt> on every run
 *  - Apply changes to Realm (upsert or tombstone)
 *
 * Conflicts: per-op `{ ok: false, conflict, current }` returned in the
 * /v1/sync/push response body; engine writes the server's `current`
 * value back into Realm, increments the conflictCount in the sync
 * store, and surfaces a non-blocking indicator (per F6.5 + N1.4).
 *
 * Rate limiting: 60 writes/min, 600 reads/min per principal. On 429
 * the engine reads Retry-After and pauses the loop accordingly.
 *
 * The engine is started by AppProviders on first authenticated mount;
 * runs once on start, then every 5 minutes (foreground), and on
 * AppState 'active' events.
 */

import { AppState, type AppStateStatus } from 'react-native';

import { registerBoot as apiCreateBoot } from '@/api/boots';
import { createHorse as apiCreateHorse } from '@/api/horses';
import { createScan as apiCreateScan } from '@/api/scans';
import { syncPull, syncPush, type SyncPushOp } from '@/api/sync';
import { useAuthStore } from '@/auth';
import { getRealm } from '@/db/realm';
import {
  ScanSchema,
  BootSchema,
  HorseSchema,
} from '@/db/schemas';

import { useSyncStore } from './store';

const SYNC_INTERVAL_MS = 5 * 60 * 1000;
const PUSH_BATCH = 50;

let _runningPromise: Promise<void> | null = null;
let _interval: ReturnType<typeof setInterval> | null = null;
let _appStateSub: { remove: () => void } | null = null;
let _lastSyncedAt: Date | null = null;

/** Idempotent — call once on app start (after auth bootstrap). */
export function startSyncEngine(): void {
  if (_interval) return; // already started
  _interval = setInterval(() => {
    void runSync().catch(() => {
      /* surfaced via the sync store */
    });
  }, SYNC_INTERVAL_MS);

  _appStateSub = AppState.addEventListener('change', (next: AppStateStatus) => {
    if (next === 'active') {
      void runSync().catch(() => {});
    }
  });

  // First run.
  void runSync().catch(() => {});
}

export function stopSyncEngine(): void {
  if (_interval) {
    clearInterval(_interval);
    _interval = null;
  }
  if (_appStateSub) {
    _appStateSub.remove();
    _appStateSub = null;
  }
}

export async function runSync(): Promise<void> {
  // Single-flight: if a run is in progress, await it instead of double-running.
  if (_runningPromise) {
    await _runningPromise;
    return;
  }
  _runningPromise = doRun();
  try {
    await _runningPromise;
  } finally {
    _runningPromise = null;
  }
}

async function doRun(): Promise<void> {
  const auth = useAuthStore.getState();
  if (auth.status !== 'authenticated') return;

  const sync = useSyncStore.getState();
  sync.setStatus('syncing');
  sync.setError(null);

  let realm;
  try {
    realm = await getRealm();
  } catch {
    // Realm unavailable (Expo Go) — sync engine no-ops.
    sync.setStatus('idle');
    return;
  }

  // ------- 1. Push creates (per-resource POSTs) ----------------------------
  const pushedClientIds = new Set<string>();
  const dirty = collectDirty(realm);
  sync.setPending(dirty.creates.length + dirty.edits.length);

  for (const create of dirty.creates) {
    const result = await pushCreate(create);
    if (result === 'rate-limited') {
      sync.setStatus('rate-limited');
      return;
    }
    if (result === 'network') {
      sync.setStatus('offline');
      return;
    }
    if (result === 'ok') {
      pushedClientIds.add(create.clientId);
      markSynced(realm, create.schemaName, create.id, create.serverData);
    }
  }

  // ------- 2. Push edits (batched /v1/sync/push) ---------------------------
  const ops: SyncPushOp[] = dirty.edits.slice(0, PUSH_BATCH).map((e) => ({
    op: 'upsert' as const,
    type: e.type,
    clientId: e.clientId,
    data: e.data,
    version: e.lastKnownServerVersion,
  }));

  if (ops.length > 0) {
    const pushRes = await syncPush(ops, _lastSyncedAt);
    if (!pushRes.ok) {
      if (pushRes.code === 'rate_limited') {
        sync.setStatus('rate-limited');
        return;
      }
      if (pushRes.code === 'network') {
        sync.setStatus('offline');
        return;
      }
      sync.setStatus('error');
      sync.setError(pushRes.message);
      return;
    }
    for (const r of pushRes.data.results) {
      if (r.ok) {
        const edit = dirty.edits.find((e) => e.clientId === r.clientId);
        if (edit) markSynced(realm, edit.schemaName, edit.id, r.data);
      } else {
        useSyncStore.getState().recordConflict();
        // Write the canonical server state back so local + server agree.
        if (r.current) {
          const edit = dirty.edits.find((e) => e.clientId === r.clientId);
          if (edit) markSynced(realm, edit.schemaName, edit.id, r.current);
        }
      }
    }
  }

  // ------- 3. Pull inbound delta -------------------------------------------
  const pullRes = await syncPull(_lastSyncedAt);
  if (!pullRes.ok) {
    if (pullRes.code === 'network') {
      sync.setStatus('offline');
      return;
    }
    if (pullRes.code === 'rate_limited') {
      sync.setStatus('rate-limited');
      return;
    }
    sync.setStatus('error');
    sync.setError(pullRes.message);
    return;
  }
  applyPull(realm, pullRes.data);
  _lastSyncedAt = new Date();
  sync.setLastSynced(_lastSyncedAt);
  sync.setPending(0);
  sync.setStatus('idle');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type DirtyCreate = {
  schemaName: string;
  type: 'Horse' | 'Boot' | 'Scan';
  id: string;
  clientId: string;
  serverData: Record<string, unknown>;
  payload: Record<string, unknown>;
};

type DirtyEdit = {
  schemaName: string;
  type: 'Horse' | 'Boot';
  id: string;
  clientId: string;
  data: Record<string, unknown>;
  lastKnownServerVersion: number;
};

function collectDirty(realm: any): {
  creates: DirtyCreate[];
  edits: DirtyEdit[];
} {
  const creates: DirtyCreate[] = [];
  const edits: DirtyEdit[] = [];

  const horses = (realm.objects(HorseSchema.schema.name) as any).filtered(
    'localDirty == true AND pendingDelete == false',
  );
  for (const h of horses) {
    const record = horseToWire(h);
    if (h.serverVersion === 0) {
      creates.push({
        schemaName: HorseSchema.schema.name,
        type: 'Horse',
        id: h.id,
        clientId: h.id,
        payload: record,
        serverData: { ...record, serverVersion: 1 },
      });
    } else {
      edits.push({
        schemaName: HorseSchema.schema.name,
        type: 'Horse',
        id: h.id,
        clientId: h.id,
        data: record,
        lastKnownServerVersion: h.serverVersion,
      });
    }
  }

  const boots = (realm.objects(BootSchema.schema.name) as any).filtered(
    'localDirty == true AND pendingDelete == false',
  );
  for (const b of boots) {
    const record = bootToWire(b);
    if (b.serverVersion === 0) {
      creates.push({
        schemaName: BootSchema.schema.name,
        type: 'Boot',
        id: b.id,
        clientId: b.id,
        payload: record,
        serverData: { ...record, serverVersion: 1 },
      });
    } else {
      edits.push({
        schemaName: BootSchema.schema.name,
        type: 'Boot',
        id: b.id,
        clientId: b.id,
        data: record,
        lastKnownServerVersion: b.serverVersion,
      });
    }
  }

  const scans = (realm.objects(ScanSchema.schema.name) as any).filtered(
    'localDirty == true AND pendingDelete == false',
  );
  for (const s of scans) {
    // Scans are write-once — only push the create. Edits to scans (e.g.
    // assigning a horseId from Quick Read) go through /v1/sync/push as
    // a Horse update on the scan… in Phase 1 we treat the assignment as
    // an idempotent re-POST since the backend's clientId-based primary
    // key collapses retries onto the same scan row.
    creates.push({
      schemaName: ScanSchema.schema.name,
      type: 'Scan',
      id: s.id,
      clientId: s.clientId,
      payload: scanToWire(s),
      serverData: { id: s.id, serverVersion: 1 },
    });
  }

  return { creates, edits };
}

function horseToWire(h: any): Record<string, unknown> {
  return {
    id: h.id,
    organizationId: h.organizationId,
    name: h.name,
    breed: h.breed ?? null,
    heightHands: h.heightHands ?? null,
    weightLbs: h.weightLbs ?? null,
    age: h.age ?? null,
    sex: h.sex ?? null,
    color: h.color ?? null,
    uniqueMarkings: h.uniqueMarkings ?? null,
    discipline: h.discipline ?? null,
    ownerName: h.ownerName ?? null,
    trainerName: h.trainerName ?? null,
    contactInfo: h.contactInfo ?? null,
    photoUrl: h.photoUrl ?? null,
  };
}

function bootToWire(b: any): Record<string, unknown> {
  return {
    id: b.id,
    organizationId: b.organizationId,
    serial: b.serial,
    name: b.name ?? null,
    firmware: b.firmware ?? null,
    lastBatteryPct: b.lastBatteryPct ?? null,
    defaultHorseId: b.defaultHorseId ?? null,
  };
}

function scanToWire(s: any): Record<string, unknown> {
  return {
    clientId: s.clientId,
    horseId: s.horseId ?? null,
    bootId: s.bootId ?? null,
    leg: s.leg,
    capturedAt:
      s.capturedAt instanceof Date ? s.capturedAt.toISOString() : s.capturedAt,
    activity: {
      type: s.activityType ?? undefined,
      intensity: s.intensity ?? undefined,
      durationMinutes: s.durationMinutes ?? undefined,
      footing: s.footing ?? undefined,
    },
    notes: s.notes ?? undefined,
    readings: Array.from(s.readings ?? []).map((r: any) => ({
      sensorIndex: r.sensorIndex,
      region: r.region,
      tempF: r.tempF,
    })),
  };
}

async function pushCreate(
  c: DirtyCreate,
): Promise<'ok' | 'rate-limited' | 'network' | 'error'> {
  if (c.type === 'Horse') {
    const res = await apiCreateHorse(c.payload as any);
    if (res.ok) {
      Object.assign(c.serverData, res.data);
      return 'ok';
    }
    if (res.code === 'rate_limited') return 'rate-limited';
    if (res.code === 'network') return 'network';
    return 'error';
  }
  if (c.type === 'Boot') {
    const res = await apiCreateBoot(c.payload as any);
    if (res.ok) {
      Object.assign(c.serverData, res.data);
      return 'ok';
    }
    if (res.code === 'rate_limited') return 'rate-limited';
    if (res.code === 'network') return 'network';
    return 'error';
  }
  if (c.type === 'Scan') {
    const res = await apiCreateScan(c.payload as any);
    if (res.ok) {
      Object.assign(c.serverData, res.data);
      return 'ok';
    }
    if (res.code === 'rate_limited') return 'rate-limited';
    if (res.code === 'network') return 'network';
    return 'error';
  }
  return 'error';
}

function markSynced(
  realm: any,
  schemaName: string,
  id: string,
  server: Record<string, unknown>,
): void {
  realm.write(() => {
    const existing = realm.objectForPrimaryKey(schemaName, id);
    if (!existing) return;
    Object.assign(existing as Record<string, unknown>, {
      ...server,
      localDirty: false,
      lastSyncedAt: new Date(),
      serverVersion:
        typeof (server as any).serverVersion === 'number'
          ? (server as any).serverVersion
          : ((existing as any).serverVersion ?? 0) + 1,
    });
  });
}

function applyPull(realm: any, body: { changes?: Array<{ type: string; op: string; data: Record<string, unknown> }> }): void {
  if (!body.changes) return;
  realm.write(() => {
    for (const change of body.changes!) {
      const schemaName = change.type;
      if (change.op === 'delete') {
        const existing = realm.objectForPrimaryKey(
          schemaName,
          (change.data as { id: string }).id,
        );
        if (existing) {
          (existing as Record<string, unknown>).pendingDelete = true;
        }
        continue;
      }
      // upsert
      try {
        realm.create(
          schemaName,
          {
            ...change.data,
            localDirty: false,
            lastSyncedAt: new Date(),
          },
          'modified',
        );
      } catch {
        // Schema doesn't include this resource yet (Phase 2 surfaces) — skip.
      }
    }
  });
}
