export type AuthMode = 'cognito' | 'local-dev';

export type AuthStatus =
  | 'booting'
  | 'unauthenticated'
  | 'authenticating'
  | 'authenticated';

export type AuthUser = {
  id: string;
  cognitoSub: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  prefsTempUnit: 'F' | 'C';
  prefsHeightUnit: 'hands' | 'cm';
  prefsWeightUnit: 'lbs' | 'kg';
  prefsTheme: 'system' | 'light' | 'dark';
};

export type AuthMembership = {
  id: string;
  organizationId: string;
  organizationName: string;
  role: 'OWNER' | 'TRAINER' | 'STAFF' | 'READ_ONLY';
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
