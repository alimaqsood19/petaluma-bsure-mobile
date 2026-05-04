/**
 * Mobile-side wrapper for /v1/boots endpoints. Used by the pairing
 * flow (T1.20) and the sync engine (T1.25).
 *
 * Backend contract: POST /v1/boots requires Idempotency-Key (handled by
 * the api client) + the request body { organizationId, serial, name?,
 * firmware?, lastBatteryPct? }.
 */

import { apiRequest, type ApiResult } from './client';

export type ApiBoot = {
  id: string;
  organizationId: string;
  serial: string;
  name: string | null;
  model: string | null;
  firmware: string | null;
  lastBatteryPct: number | null;
  lastSeenAt: string | null;
  createdAt: string;
};

export async function registerBoot(input: {
  organizationId: string;
  serial: string;
  name?: string;
  firmware?: string;
  lastBatteryPct?: number;
}): Promise<ApiResult<ApiBoot>> {
  return apiRequest<ApiBoot>('/v1/boots', {
    method: 'POST',
    body: input,
  });
}

export async function patchBoot(
  id: string,
  patch: Partial<{ name: string; defaultHorseId: string | null }>,
): Promise<ApiResult<ApiBoot>> {
  return apiRequest<ApiBoot>(`/v1/boots/${id}`, {
    method: 'PATCH',
    body: patch,
  });
}
