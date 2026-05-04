import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { useAuthStore } from '@/auth/authStore';

jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    AFTER_FIRST_UNLOCK: 'AFTER_FIRST_UNLOCK',
    getItemAsync: jest.fn(async (k: string) => store.get(k) ?? null),
    setItemAsync: jest.fn(async (k: string, v: string) => {
      store.set(k, v);
    }),
    deleteItemAsync: jest.fn(async (k: string) => {
      store.delete(k);
    }),
  };
});

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  useAuthStore.setState({
    status: 'booting',
    mode: null,
    token: null,
    user: null,
    memberships: [],
    lastError: null,
    profileCompletedLocally: false,
  });
});

describe('completeProfile', () => {
  it('falls back to local-only when PATCH /v1/me returns 404 (backend gap)', async () => {
    seedAuthed();
    global.fetch = jest.fn(async () => notFound()) as unknown as typeof fetch;

    const result = await useAuthStore.getState().completeProfile({
      firstName: 'Sarah',
      lastName: 'Wells',
      role: 'rider',
      stableName: 'Wells Family Stables',
    });

    expect(result.ok).toBe(true);
    expect(result.degraded).toBe(true);
    const s = useAuthStore.getState();
    expect(s.user?.firstName).toBe('Sarah');
    expect(s.user?.lastName).toBe('Wells');
    expect(s.user?.role).toBe('rider');
    expect(s.profileCompletedLocally).toBe(true);
  });

  it('skips POST /v1/organizations when the user already has memberships', async () => {
    seedAuthed({ withMembership: true });
    const fetchMock = jest.fn(async () => notFound());
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await useAuthStore.getState().completeProfile({
      firstName: 'Sarah',
      lastName: 'Wells',
      role: 'rider',
      stableName: 'Existing Barn',
    });

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1); // PATCH /v1/me only
    const url = (fetchMock as jest.Mock).mock.calls[0]?.[0] as string | undefined;
    expect(url ?? '').toContain('/v1/me');
  });

  it('surfaces non-404 errors instead of silently degrading', async () => {
    seedAuthed();
    global.fetch = jest.fn(async () =>
      jsonResponse(500, { message: 'boom' }),
    ) as unknown as typeof fetch;

    const result = await useAuthStore.getState().completeProfile({
      firstName: 'Sarah',
      lastName: 'Wells',
      role: 'rider',
      stableName: 'X',
    });
    expect(result.ok).toBe(false);
    expect(result.error?.message).toBe('boom');
  });
});

function seedAuthed(opts: { withMembership?: boolean } = {}) {
  useAuthStore.setState({
    status: 'authenticated',
    mode: 'local-dev',
    token: 'dev-alice',
    user: {
      id: 'u1',
      cognitoSub: 'local:alice',
      email: 'alice@example.com',
      firstName: null,
      lastName: null,
      role: null,
    },
    memberships: opts.withMembership
      ? [{ id: 'm1', organizationId: 'o1', organizationName: 'X', role: 'OWNER' }]
      : [],
    lastError: null,
    profileCompletedLocally: false,
  });
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function notFound(): Response {
  return jsonResponse(404, { message: 'Not Found', statusCode: 404 });
}
