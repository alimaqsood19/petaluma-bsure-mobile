/// <reference types="expo-router/types" />

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_API_URL: string;
    EXPO_PUBLIC_DEV_BEARER?: string;
    EXPO_PUBLIC_COGNITO_USER_POOL_ID?: string;
    EXPO_PUBLIC_COGNITO_REGION?: string;
    EXPO_PUBLIC_COGNITO_APP_CLIENT_ID?: string;
    EXPO_PUBLIC_SENTRY_DSN?: string;
    EXPO_PUBLIC_WEB_BASE_URL?: string;
  }
}
