/**
 * ThemeProvider.tsx
 *
 * Wraps the app with Tamagui's TamaguiProvider, plus reads the user's theme
 * preference from secure storage and switches the active theme accordingly.
 *
 * Usage:
 *   import { ThemeProvider } from './src/ui';
 *   export default function App() {
 *     return <ThemeProvider>...</ThemeProvider>;
 *   }
 *
 * Phase 1 reads the preference from `expo-secure-store`; Phase 2 will sync it
 * to the API per F10.1.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { TamaguiProvider } from 'tamagui';

import config from '../../tamagui.config';

type ThemePreference = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  preference: ThemePreference;
  resolvedTheme: 'light' | 'dark';
  setPreference: (p: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useThemePreference(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemePreference must be used inside a <ThemeProvider>');
  }
  return ctx;
}

type ThemeProviderProps = {
  children: React.ReactNode;
  /**
   * Override the initial preference (used for Storybook + tests). When
   * unset, the value is read from secure storage on mount; until it loads
   * we fall back to the system preference (constitution P3 — barn at night
   * usually means dark).
   */
  initialPreference?: ThemePreference;
};

export function ThemeProvider({ children, initialPreference }: ThemeProviderProps) {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const [preference, setPreferenceState] = useState<ThemePreference>(
    initialPreference ?? 'system'
  );

  // TODO(T1.26): hydrate from expo-secure-store on mount.
  useEffect(() => {
    // const stored = await SecureStore.getItemAsync('theme.preference');
    // if (stored) setPreferenceState(stored as ThemePreference);
  }, []);

  const resolvedTheme: 'light' | 'dark' =
    preference === 'system' ? (systemScheme ?? 'dark') : preference;

  const setPreference = (p: ThemePreference) => {
    setPreferenceState(p);
    // TODO(T1.26): persist to expo-secure-store.
  };

  return (
    <ThemeContext.Provider value={{ preference, resolvedTheme, setPreference }}>
      <TamaguiProvider config={config} defaultTheme={resolvedTheme}>
        {children}
      </TamaguiProvider>
    </ThemeContext.Provider>
  );
}
