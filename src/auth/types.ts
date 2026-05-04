export type AuthMode = 'cognito' | 'local-dev';

export type AuthStatus =
  | 'booting'
  | 'unauthenticated'
  | 'authenticating'
  | 'authenticated';

export type UserRole = 'rider' | 'trainer' | 'staff' | 'manager' | 'vet' | 'other';

export type AuthUser = {
  id: string;
  cognitoSub: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role?: UserRole | string | null;
  prefsTempUnit?: 'F' | 'C';
  prefsHeightUnit?: 'hands' | 'cm';
  prefsWeightUnit?: 'lbs' | 'kg';
  prefsTheme?: 'system' | 'light' | 'dark';
};

export type ProfileCompletionInput = {
  firstName: string;
  lastName: string;
  role: UserRole;
  stableName: string;
  discipline?: string;
};

export type AuthMembership = {
  id: string;
  organizationId: string;
  organizationName?: string;
  role: 'OWNER' | 'TRAINER' | 'STAFF' | 'READ_ONLY';
};

/**
 * Shape returned by the bsure-api `/v1/me` endpoint as of 2026-05-04. The
 * controller currently does not expose pref fields or the `role` column;
 * memberships nest the organization as `organization: { id, name }`.
 * Mapped to AuthUser/AuthMembership in `authStore.fetchMe()`.
 */
export type ApiMeResponse = {
  user: {
    id: string;
    cognitoSub: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    role?: string | null;
    prefsTempUnit?: 'F' | 'C';
    prefsHeightUnit?: 'hands' | 'cm';
    prefsWeightUnit?: 'lbs' | 'kg';
    prefsTheme?: 'system' | 'light' | 'dark';
  };
  memberships: Array<{
    id: string;
    organizationId: string;
    role: 'OWNER' | 'TRAINER' | 'STAFF' | 'READ_ONLY';
    organization?: { id: string; name: string };
  }>;
};

export type MeResponse = {
  user: AuthUser;
  memberships: AuthMembership[];
};

export type AuthError = {
  code: 'invalid_token' | 'network' | 'rate_limited' | 'unknown';
  message: string;
  retryAfterSec?: number;
};
