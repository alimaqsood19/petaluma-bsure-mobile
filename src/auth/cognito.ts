/**
 * cognito.ts — entry points for Apple / Google / Email Cognito sign-in.
 *
 * Real Cognito Hosted UI + native expo-apple-authentication wiring lands
 * once T1.01.6 provisions the dev pool. Until then, every entry-point
 * delegates to the LOCAL_DEV stub bearer per ADR 0021 — the screens
 * stay on the same shape so we don't have to rewrite UX when the pool
 * lands.
 */

import { useAuthStore } from './authStore';

const DEV_BEARER_FROM_ENV = process.env.EXPO_PUBLIC_DEV_BEARER ?? 'dev-user-1';

function devUseridFromEnv(): string {
  const raw = DEV_BEARER_FROM_ENV.startsWith('dev-')
    ? DEV_BEARER_FROM_ENV.slice(4)
    : DEV_BEARER_FROM_ENV;
  return raw || 'user-1';
}

export type CognitoProvider = 'apple' | 'google' | 'email';

export type SignInOutcome =
  | { ok: true }
  | { ok: false; reason: string };

export async function signInWithProvider(
  provider: CognitoProvider,
  /** For email path, the user-typed username. For apple/google, ignored — we
   *  fall back to EXPO_PUBLIC_DEV_BEARER until the Cognito pool exists. */
  emailOrUserid?: string,
): Promise<SignInOutcome> {
  const useridSeed =
    provider === 'email' && emailOrUserid
      ? sanitize(emailOrUserid)
      : `${provider}-${devUseridFromEnv()}`;

  const { signInLocalDev } = useAuthStore.getState();
  const result = await signInLocalDev(useridSeed);
  if (result.ok) return { ok: true };
  return { ok: false, reason: result.error?.message ?? 'Sign-in failed.' };
}

function sanitize(raw: string): string {
  // Cognito-style local userids must be `[a-zA-Z0-9_-]+`. Strip the @-and-after
  // and replace anything else with an underscore.
  const before = raw.split('@')[0] ?? raw;
  return before.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 60);
}

/** True until T1.01.6 provisions the real Cognito pool. */
export const COGNITO_POOL_READY = false;
