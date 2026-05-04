import { useColorScheme } from 'react-native';
import { TamaguiProvider } from 'tamagui';

import config from '../../tamagui.config';

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const scheme = useColorScheme();
  const resolved: 'light' | 'dark' = scheme === 'light' ? 'light' : 'dark';
  return (
    <TamaguiProvider config={config} defaultTheme={resolved}>
      {children}
    </TamaguiProvider>
  );
}
