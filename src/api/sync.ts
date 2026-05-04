import { apiRequest, type ApiResult } from './client';

export type SyncPushOp = {
  op: 'upsert' | 'delete';
  type: 'Horse' | 'Boot';
  clientId: string;
  data?: Record<string, unknown>;
  version: number;
};

export type SyncPushResult = {
  results: Array<
    | {
        ok: true;
        clientId: string;
        type: string;
        serverVersion: number;
        data: Record<string, unknown>;
      }
    | {
        ok: false;
        clientId: string;
        type: string;
        conflict: 'server-newer' | 'not-found' | 'invalid';
        current?: Record<string, unknown>;
      }
  >;
};

export type SyncPullResponse = {
  cursor: string;
  changes: Array<{
    type: 'Horse' | 'Boot' | 'Scan' | 'Activity' | 'Alert' | 'Note' | 'Membership' | 'Organization' | 'User';
    op: 'upsert' | 'delete';
    data: Record<string, unknown>;
  }>;
};

export async function syncPull(
  since: Date | null,
): Promise<ApiResult<SyncPullResponse>> {
  const sinceParam = since ? `?since=${encodeURIComponent(since.toISOString())}` : '';
  return apiRequest<SyncPullResponse>(`/v1/sync/pull${sinceParam}`, {
    method: 'POST',
    body: {},
  });
}

export async function syncPush(
  ops: SyncPushOp[],
  clientLastSyncAt: Date | null,
): Promise<ApiResult<SyncPushResult>> {
  return apiRequest<SyncPushResult>('/v1/sync/push', {
    method: 'POST',
    body: {
      clientLastSyncAt: clientLastSyncAt?.toISOString() ?? null,
      operations: ops,
    },
  });
}
