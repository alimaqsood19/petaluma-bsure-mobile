import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { TamaguiProvider } from 'tamagui';

import { useAuthStore } from '@/auth';
import { usePrefsStore } from '@/prefs/store';
import { startSyncEngine, stopSyncEngine } from '@/sync/engine';

import config from '../../tamagui.config';

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const scheme = useColorScheme();
  const themePref = usePrefsStore((s) => s.theme);
  const hydrate = usePrefsStore((s) => s.hydrate);
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (status === 'authenticated') {
      startSyncEngine();
      return () => {
        stopSyncEngine();
      };
    }
    return;
  }, [status]);

  const resolved: 'light' | 'dark' =
    themePref === 'system'
      ? scheme === 'light'
        ? 'light'
        : 'dark'
      : themePref;

  return (
    <TamaguiProvider config={config} defaultTheme={resolved}>
      {children}
    </TamaguiProvider>
  );
}
