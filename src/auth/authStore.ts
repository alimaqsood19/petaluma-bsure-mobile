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
  AuthError,
  AuthMembership,
  AuthMode,
  AuthStatus,
  AuthUser,
  MeResponse,
} from './types';

const DEV_BEARER_PATTERN = /^dev-[a-zA-Z0-9_-]+$/;

type AuthState = {
  status: AuthStatus;
  mode: AuthMode | null;
  token: string | null;
  user: AuthUser | null;
  memberships: AuthMembership[];
  lastError: AuthError | null;

  bootstrap: () => Promise<void>;
  signInLocalDev: (userid: string) => Promise<{ ok: boolean; error?: AuthError }>;
  refreshMe: () => Promise<{ ok: boolean; error?: AuthError }>;
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

  signOut: async () => {
    await clearTokens();
    set({
      status: 'unauthenticated',
      mode: null,
      token: null,
      user: null,
      memberships: [],
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
  const res = await apiRequest<MeResponse>('/v1/me', { token });
  if (res.ok) return { ok: true, data: res.data };
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
