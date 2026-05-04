/**
 * Sync engine status, surfaced to the UI as a small indicator.
 *
 * Distinguishes:
 *  - idle      : no sync activity, queue empty
 *  - syncing   : a run is in progress
 *  - error     : the last run failed; engine will retry on next tick
 *  - offline   : the last run failed because of a network error
 *  - rate-limited : 429 with a Retry-After
 */

import { create } from 'zustand';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline' | 'rate-limited';

type SyncState = {
  status: SyncStatus;
  pendingCount: number;
  conflictCount: number;
  lastSyncedAt: Date | null;
  lastError: string | null;
  retryAfterSec: number | null;
  setStatus: (s: SyncStatus) => void;
  setPending: (n: number) => void;
  setLastSynced: (d: Date | null) => void;
  setError: (msg: string | null) => void;
  recordConflict: () => void;
  clearConflicts: () => void;
};

export const useSyncStore = create<SyncState>((set) => ({
  status: 'idle',
  pendingCount: 0,
  conflictCount: 0,
  lastSyncedAt: null,
  lastError: null,
  retryAfterSec: null,
  setStatus: (status) => set({ status }),
  setPending: (n) => set({ pendingCount: n }),
  setLastSynced: (d) => set({ lastSyncedAt: d }),
  setError: (msg) => set({ lastError: msg }),
  recordConflict: () => set((s) => ({ conflictCount: s.conflictCount + 1 })),
  clearConflicts: () => set({ conflictCount: 0 }),
}));
