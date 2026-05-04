/**
 * api/client.ts — single fetch wrapper for the bsure-api.
 *
 * - attaches `Authorization: Bearer <token>` from the auth store
 * - injects `Idempotency-Key` on writes (UUIDv4) when not provided
 * - surfaces 401 / 429 / network errors as a typed result so callers
 *   can route to sign-out / retry / offline queueing without
 *   re-parsing fetch internals
 *
 * Per backend contract: writes capped at 60/min/principal,
 * reads at 600/min/principal — 429 carries a `Retry-After` header.
 */

const DEFAULT_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

type WriteVerb = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiSuccess<T> = { ok: true; status: number; data: T };
export type ApiFailure = {
  ok: false;
  status: number;
  code:
    | 'unauthorized'
    | 'forbidden'
    | 'not_found'
    | 'rate_limited'
    | 'network'
    | 'server'
    | 'unknown';
  message: string;
  retryAfterSec?: number;
  body?: unknown;
};
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

type RequestOptions = {
  method?: 'GET' | WriteVerb;
  body?: unknown;
  headers?: Record<string, string>;
  idempotencyKey?: string;
  /** Override the bearer token; default reads from getToken(). */
  token?: string | null;
  /** Abort signal for cancellation. */
  signal?: AbortSignal;
  /** Override base URL (tests). */
  baseUrl?: string;
};

let _getToken: () => string | null = () => null;

export function configureApiClient(opts: { getToken: () => string | null }) {
  _getToken = opts.getToken;
}

function uuid(): string {
  // RFC4122 v4 — sufficient for Idempotency-Key (>= 8 chars, [A-Za-z0-9_-])
  const bytes = new Uint8Array(16);
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function isWrite(method: string): method is WriteVerb {
  return method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';
}

export async function apiRequest<T>(
  path: string,
  opts: RequestOptions = {},
): Promise<ApiResult<T>> {
  const baseUrl = opts.baseUrl ?? DEFAULT_BASE_URL;
  const method = opts.method ?? 'GET';
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...opts.headers,
  };
  const token = opts.token === undefined ? _getToken() : opts.token;
  if (token) headers.Authorization = `Bearer ${token}`;
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (isWrite(method)) {
    headers['Idempotency-Key'] = opts.idempotencyKey ?? uuid();
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: opts.signal,
    });
  } catch (e) {
    return {
      ok: false,
      status: 0,
      code: 'network',
      message: e instanceof Error ? e.message : 'Network request failed',
    };
  }

  const text = await res.text();
  let body: unknown = undefined;
  if (text.length > 0) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (res.ok) {
    return { ok: true, status: res.status, data: body as T };
  }

  if (res.status === 401) {
    return {
      ok: false,
      status: 401,
      code: 'unauthorized',
      message: extractMessage(body, 'Unauthorized'),
      body,
    };
  }
  if (res.status === 403) {
    return {
      ok: false,
      status: 403,
      code: 'forbidden',
      message: extractMessage(body, 'Forbidden'),
      body,
    };
  }
  if (res.status === 404) {
    return {
      ok: false,
      status: 404,
      code: 'not_found',
      message: extractMessage(body, 'Not found'),
      body,
    };
  }
  if (res.status === 429) {
    const retryAfter = Number(res.headers.get('retry-after'));
    return {
      ok: false,
      status: 429,
      code: 'rate_limited',
      message: extractMessage(body, 'Rate limited'),
      retryAfterSec: Number.isFinite(retryAfter) ? retryAfter : 30,
      body,
    };
  }
  if (res.status >= 500) {
    return {
      ok: false,
      status: res.status,
      code: 'server',
      message: extractMessage(body, `Server error ${res.status}`),
      body,
    };
  }
  return {
    ok: false,
    status: res.status,
    code: 'unknown',
    message: extractMessage(body, `Request failed (${res.status})`),
    body,
  };
}

function extractMessage(body: unknown, fallback: string): string {
  if (body && typeof body === 'object' && 'message' in body) {
    const m = (body as { message: unknown }).message;
    if (typeof m === 'string') return m;
    if (Array.isArray(m) && typeof m[0] === 'string') return m[0];
  }
  return fallback;
}

export const apiBaseUrl = DEFAULT_BASE_URL;
