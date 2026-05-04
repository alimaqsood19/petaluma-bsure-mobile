import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'bsure.auth.token.v1';
const REFRESH_KEY = 'bsure.auth.refresh.v1';

export async function loadToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
  });
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}

export async function loadRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_KEY);
  } catch {
    return null;
  }
}

export async function saveRefreshToken(refresh: string): Promise<void> {
  await SecureStore.setItemAsync(REFRESH_KEY, refresh, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
  });
}
