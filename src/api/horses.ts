/**
 * /v1/horses wrapper. RBAC enforcement happens server-side
 * (owner/trainer for create/edit, member for list/read).
 */

import { apiRequest, type ApiResult } from './client';

export type ApiHorse = {
  id: string;
  organizationId: string;
  name: string;
  breed: string | null;
  heightHands: number | null;
  weightLbs: number | null;
  age: number | null;
  sex: string | null;
  color: string | null;
  uniqueMarkings: string | null;
  discipline: string | null;
  ownerName: string | null;
  trainerName: string | null;
  contactInfo: string | null;
  photoUrl: string | null;
  archivedAt: string | null;
  createdAt: string;
};

export type HorseCreateInput = {
  organizationId: string;
  name: string;
  breed?: string;
  heightHands?: number;
  weightLbs?: number;
  age?: number;
  sex?: string;
  color?: string;
  uniqueMarkings?: string;
  discipline?: string;
  ownerName?: string;
  trainerName?: string;
  contactInfo?: string;
  photoUrl?: string;
};

export async function listHorses(
  organizationId: string,
): Promise<ApiResult<{ horses: ApiHorse[] }>> {
  return apiRequest<{ horses: ApiHorse[] }>(
    `/v1/horses?orgId=${encodeURIComponent(organizationId)}`,
  );
}

export async function createHorse(
  input: HorseCreateInput,
): Promise<ApiResult<ApiHorse>> {
  return apiRequest<ApiHorse>('/v1/horses', { method: 'POST', body: input });
}

export async function patchHorse(
  id: string,
  patch: Partial<HorseCreateInput>,
): Promise<ApiResult<ApiHorse>> {
  return apiRequest<ApiHorse>(`/v1/horses/${id}`, { method: 'PATCH', body: patch });
}

export async function archiveHorse(id: string): Promise<ApiResult<ApiHorse>> {
  return apiRequest<ApiHorse>(`/v1/horses/${id}/archive`, { method: 'POST', body: {} });
}
