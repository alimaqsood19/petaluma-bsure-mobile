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
  });
});

describe('useAuthStore', () => {
  it('signInLocalDev: validates the userid format', async () => {
    const result = await useAuthStore.getState().signInLocalDev('not valid!!');
    expect(result.ok).toBe(false);
    expect(useAuthStore.getState().status).toBe('booting');
  });

  it('signInLocalDev: persists the token + populates user on 200', async () => {
    global.fetch = (jest.fn() as any).mockResolvedValue(
      jsonResponse(200, {
        user: {
          id: 'u1',
          cognitoSub: 'local:alice',
          email: 'alice@example.com',
          firstName: null,
          lastName: null,
          role: null,
          prefsTempUnit: 'F',
          prefsHeightUnit: 'hands',
          prefsWeightUnit: 'lbs',
          prefsTheme: 'system',
        },
        memberships: [],
      }),
    ) as unknown as typeof fetch;

    const result = await useAuthStore.getState().signInLocalDev('alice');
    expect(result.ok).toBe(true);

    const s = useAuthStore.getState();
    expect(s.status).toBe('authenticated');
    expect(s.token).toBe('dev-alice');
    expect(s.mode).toBe('local-dev');
    expect(s.user?.cognitoSub).toBe('local:alice');
  });

  it('signInLocalDev: leaves status unauthenticated on 401', async () => {
    global.fetch = (jest.fn() as any).mockResolvedValue(
      jsonResponse(401, { message: 'bad token' }),
    ) as unknown as typeof fetch;

    const result = await useAuthStore.getState().signInLocalDev('alice');
    expect(result.ok).toBe(false);
    const s = useAuthStore.getState();
    expect(s.status).toBe('unauthenticated');
    expect(s.lastError?.code).toBe('invalid_token');
  });

  it('signOut: clears tokens and resets state', async () => {
    useAuthStore.setState({
      status: 'authenticated',
      mode: 'local-dev',
      token: 'dev-alice',
    });
    await useAuthStore.getState().signOut();
    const s = useAuthStore.getState();
    expect(s.status).toBe('unauthenticated');
    expect(s.token).toBeNull();
  });
});

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
