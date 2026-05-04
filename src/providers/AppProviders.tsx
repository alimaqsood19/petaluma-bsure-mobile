import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { TamaguiProvider } from 'tamagui';

import { useAuthStore } from '@/auth';
import { startSyncEngine, stopSyncEngine } from '@/sync/engine';

import config from '../../tamagui.config';

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const scheme = useColorScheme();
  const resolved: 'light' | 'dark' = scheme === 'light' ? 'light' : 'dark';
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status === 'authenticated') {
      startSyncEngine();
      return () => {
        stopSyncEngine();
      };
    }
    return;
  }, [status]);

  return (
    <TamaguiProvider config={config} defaultTheme={resolved}>
      {children}
    </TamaguiProvider>
  );
}
