import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { apiRequest, configureApiClient } from '@/api/client';

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  jest.restoreAllMocks();
});

describe('apiRequest', () => {
  it('attaches the bearer token from the configured getter', async () => {
    configureApiClient({ getToken: () => 'dev-alice' });
    const fetchMock = (jest.fn() as any).mockResolvedValue(makeResponse(200, { user: { id: '1' } }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const res = await apiRequest('/v1/me');

    expect(res.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer dev-alice');
  });

  it('injects an Idempotency-Key on writes when not provided', async () => {
    configureApiClient({ getToken: () => 'dev-alice' });
    const fetchMock = (jest.fn() as any).mockResolvedValue(makeResponse(201, { id: 'h1' }));
    global.fetch = fetchMock as unknown as typeof fetch;

    await apiRequest('/v1/horses', { method: 'POST', body: { name: 'Sass' } });

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const key = (init.headers as Record<string, string>)['Idempotency-Key'];
    expect(key).toMatch(/^[A-Za-z0-9_-]{8,128}$/);
  });

  it('does not set Idempotency-Key on reads', async () => {
    configureApiClient({ getToken: () => 'dev-alice' });
    const fetchMock = (jest.fn() as any).mockResolvedValue(makeResponse(200, { ok: true }));
    global.fetch = fetchMock as unknown as typeof fetch;

    await apiRequest('/v1/horses?orgId=o1');

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect((init.headers as Record<string, string>)['Idempotency-Key']).toBeUndefined();
  });

  it('surfaces 401 as { code: "unauthorized" }', async () => {
    configureApiClient({ getToken: () => 'dev-alice' });
    global.fetch = (jest.fn() as any).mockResolvedValue(
      makeResponse(401, { message: 'bad' }),
    ) as unknown as typeof fetch;

    const res = await apiRequest('/v1/me');
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe('unauthorized');
      expect(res.message).toBe('bad');
    }
  });

  it('surfaces 429 with retry-after', async () => {
    configureApiClient({ getToken: () => 'dev-alice' });
    global.fetch = (jest.fn() as any).mockResolvedValue(
      makeResponse(429, { message: 'slow down' }, { 'retry-after': '12' }),
    ) as unknown as typeof fetch;

    const res = await apiRequest('/v1/scans', { method: 'POST', body: {} });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe('rate_limited');
      expect(res.retryAfterSec).toBe(12);
    }
  });

  it('surfaces network failure as { code: "network" }', async () => {
    configureApiClient({ getToken: () => 'dev-alice' });
    global.fetch = (jest.fn() as any).mockRejectedValue(
      new TypeError('Network request failed'),
    ) as unknown as typeof fetch;

    const res = await apiRequest('/v1/me');
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe('network');
    }
  });
});

function makeResponse(
  status: number,
  body: unknown,
  extraHeaders: Record<string, string> = {},
): Response {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  return new Response(text, {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  });
}
