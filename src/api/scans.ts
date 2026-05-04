import { apiRequest, type ApiResult } from './client';

export type ApiScanCreateBody = {
  clientId: string;
  horseId: string | null;
  bootId: string | null;
  leg: 'FL' | 'FR' | 'BL' | 'BR';
  capturedAt: string;
  activity?: {
    type?: string;
    intensity?: number;
    durationMinutes?: number;
    footing?: string;
  };
  notes?: string;
  readings: Array<{ sensorIndex: number; region: string; tempF: number }>;
};

export type ApiScan = {
  id: string;
  clientId: string;
  horseId: string | null;
  organizationId: string;
  bootId: string | null;
  leg: 'FL' | 'FR' | 'BL' | 'BR';
  capturedAt: string;
};

export async function createScan(
  body: ApiScanCreateBody,
): Promise<ApiResult<ApiScan>> {
  return apiRequest<ApiScan>('/v1/scans', {
    method: 'POST',
    body,
    /**
     * Use the clientId as the Idempotency-Key — the backend already does
     * primary-key idempotency on (orgId, clientId), so retries collapse
     * onto the same scan even if the network drops mid-request.
     */
    idempotencyKey: body.clientId,
  });
}
