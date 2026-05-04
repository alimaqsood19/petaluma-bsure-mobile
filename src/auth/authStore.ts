/**
 * authStore.ts — single source of truth for auth state across the app.
 *
 * Backed by Zustand. Persists tokens via expo-secure-store (in
 * secureToken.ts) and the user/memberships in memory only — they
 * re-fetch from /v1/me on every cold start once a token is present.
 *
 * LOCAL_DEV path (ADR 0021): the user picks a dev userid; we set the
 * token to `dev-<userid>` and call /v1/me to confirm + auto-create
 * the User row server-side.
 *
 * Real Cognito hosted UI lands once T1.01.6 provisions the pool. The
 * scaffolding (signInWithApple/Google/Email entry points) is in place
 * so the screens don't have to be rewritten — they delegate to a
 * `cognito.ts` module that today fans out to LOCAL_DEV with a clear
 * banner.
 */

import { create } from 'zustand';

import { apiRequest, configureApiClient } from '@/api/client';

import {
  clearTokens,
  loadToken,
  saveToken,
} from './secureToken';
import type {
  ApiMeResponse,
  AuthError,
  AuthMembership,
  AuthMode,
  AuthStatus,
  AuthUser,
  MeResponse,
  ProfileCompletionInput,
} from './types';

const DEV_BEARER_PATTERN = /^dev-[a-zA-Z0-9_-]+$/;

type AuthState = {
  status: AuthStatus;
  mode: AuthMode | null;
  token: string | null;
  user: AuthUser | null;
  memberships: AuthMembership[];
  lastError: AuthError | null;
  /**
   * True when the user's profile completion was applied client-side only
   * (because the backend's PATCH /v1/me + POST /v1/organizations endpoints
   * don't exist yet — see STUBS.md). The mobile app proceeds optimistically;
   * the next time those endpoints land, refreshMe() will pick up the real
   * server-side state and clear this flag.
   */
  profileCompletedLocally: boolean;

  bootstrap: () => Promise<void>;
  signInLocalDev: (userid: string) => Promise<{ ok: boolean; error?: AuthError }>;
  refreshMe: () => Promise<{ ok: boolean; error?: AuthError }>;
  completeProfile: (
    input: ProfileCompletionInput,
  ) => Promise<{ ok: boolean; degraded?: boolean; error?: AuthError }>;
  signOut: () => Promise<void>;
  setError: (e: AuthError | null) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'booting',
  mode: null,
  token: null,
  user: null,
  memberships: [],
  lastError: null,
  profileCompletedLocally: false,

  bootstrap: async () => {
    const stored = await loadToken();
    if (!stored) {
      set({ status: 'unauthenticated', token: null });
      return;
    }
    const mode: AuthMode = DEV_BEARER_PATTERN.test(stored) ? 'local-dev' : 'cognito';
    set({ token: stored, mode, status: 'authenticating' });
    const result = await fetchMe(stored);
    if (result.ok) {
      set({
        status: 'authenticated',
        user: result.data.user,
        memberships: result.data.memberships,
        lastError: null,
      });
    } else {
      // Stored token rejected — clear it and surface as unauthenticated.
      await clearTokens();
      set({
        status: 'unauthenticated',
        token: null,
        mode: null,
        user: null,
        memberships: [],
        lastError: result.error,
      });
    }
  },

  signInLocalDev: async (rawUserid) => {
    const userid = rawUserid.trim();
    if (!userid || !/^[a-zA-Z0-9_-]+$/.test(userid)) {
      const error: AuthError = {
        code: 'unknown',
        message:
          'Username can only contain letters, numbers, underscores, and dashes.',
      };
      set({ lastError: error });
      return { ok: false, error };
    }

    const token = `dev-${userid}`;
    set({ status: 'authenticating', lastError: null });
    const result = await fetchMe(token);
    if (!result.ok) {
      set({ status: 'unauthenticated', lastError: result.error });
      return { ok: false, error: result.error };
    }
    await saveToken(token);
    set({
      token,
      mode: 'local-dev',
      status: 'authenticated',
      user: result.data.user,
      memberships: result.data.memberships,
    });
    return { ok: true };
  },

  refreshMe: async () => {
    const token = get().token;
    if (!token) {
      const error: AuthError = { code: 'invalid_token', message: 'No active session.' };
      return { ok: false, error };
    }
    const result = await fetchMe(token);
    if (!result.ok) {
      if (result.error.code === 'invalid_token') {
        // Token is no longer valid — sign out.
        await get().signOut();
      }
      set({ lastError: result.error });
      return { ok: false, error: result.error };
    }
    set({
      user: result.data.user,
      memberships: result.data.memberships,
      lastError: null,
    });
    return { ok: true };
  },

  completeProfile: async (input) => {
    const token = get().token;
    if (!token) {
      const error: AuthError = { code: 'invalid_token', message: 'Not signed in.' };
      return { ok: false, error };
    }

    let degraded = false;

    // Attempt 1: PATCH /v1/me with the profile fields.
    const patchRes = await apiRequest<ApiMeResponse['user']>('/v1/me', {
      method: 'PATCH',
      body: {
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role,
      },
    });

    // 404 means the backend hasn't shipped PATCH /v1/me yet (T1.17 backend
    // gap — see STUBS.md). Fall back to local-only.
    if (!patchRes.ok && patchRes.status !== 404) {
      set({ lastError: { code: 'unknown', message: patchRes.message } });
      return { ok: false, error: { code: 'unknown', message: patchRes.message } };
    }
    if (!patchRes.ok && patchRes.status === 404) degraded = true;

    // Attempt 2: POST /v1/organizations only if the user has no memberships.
    if (get().memberships.length === 0) {
      const orgRes = await apiRequest<{ id: string; name: string }>(
        '/v1/organizations',
        {
          method: 'POST',
          body: {
            name: input.stableName,
            discipline: input.discipline ?? null,
            isPersonal: true,
          },
        },
      );
      if (!orgRes.ok && orgRes.status !== 404) {
        set({ lastError: { code: 'unknown', message: orgRes.message } });
        return { ok: false, error: { code: 'unknown', message: orgRes.message } };
      }
      if (!orgRes.ok && orgRes.status === 404) degraded = true;
    }

    // Attempt 3: re-fetch /v1/me to pick up any server-side changes.
    if (!degraded) {
      await get().refreshMe();
    }

    // Always patch the local user record so the auth gate routes through to
    // /(tabs). When the backend lands the endpoints, refreshMe() will overwrite
    // this with the canonical state.
    const previous = get().user;
    set({
      user: previous
        ? {
            ...previous,
            firstName: input.firstName,
            lastName: input.lastName,
            role: input.role,
          }
        : previous,
      profileCompletedLocally: degraded,
      lastError: null,
    });

    return { ok: true, degraded };
  },

  signOut: async () => {
    await clearTokens();
    set({
      status: 'unauthenticated',
      mode: null,
      token: null,
      user: null,
      memberships: [],
      profileCompletedLocally: false,
    });
  },

  setError: (e) => set({ lastError: e }),
}));

// Wire api client to read the live token without circular imports.
configureApiClient({ getToken: () => useAuthStore.getState().token });

async function fetchMe(
  token: string,
): Promise<
  | { ok: true; data: MeResponse }
  | { ok: false; error: AuthError }
> {
  const res = await apiRequest<ApiMeResponse>('/v1/me', { token });
  if (res.ok) return { ok: true, data: mapMeResponse(res.data) };
  if (res.status === 401) {
    return {
      ok: false,
      error: { code: 'invalid_token', message: 'Session expired or invalid.' },
    };
  }
  if (res.code === 'rate_limited') {
    return {
      ok: false,
      error: {
        code: 'rate_limited',
        message: res.message,
        retryAfterSec: res.retryAfterSec,
      },
    };
  }
  if (res.code === 'network') {
    return {
      ok: false,
      error: { code: 'network', message: res.message },
    };
  }
  return {
    ok: false,
    error: { code: 'unknown', message: res.message },
  };
}

function mapMeResponse(api: ApiMeResponse): MeResponse {
  return {
    user: {
      id: api.user.id,
      cognitoSub: api.user.cognitoSub,
      email: api.user.email,
      firstName: api.user.firstName,
      lastName: api.user.lastName,
      role: api.user.role ?? null,
      prefsTempUnit: api.user.prefsTempUnit,
      prefsHeightUnit: api.user.prefsHeightUnit,
      prefsWeightUnit: api.user.prefsWeightUnit,
      prefsTheme: api.user.prefsTheme,
    },
    memberships: api.memberships.map((m) => ({
      id: m.id,
      organizationId: m.organizationId,
      organizationName: m.organization?.name,
      role: m.role,
    })),
  };
}
