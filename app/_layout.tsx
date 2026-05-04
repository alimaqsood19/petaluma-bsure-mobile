import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useAuthStore } from '@/auth';
import { AppProviders } from '@/providers/AppProviders';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>
        <StatusBar style="light" />
        <AuthGate>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#0A1816' },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="sign-in" options={{ headerShown: false }} />
            <Stack.Screen
              name="complete-profile"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="boots" options={{ headerShown: false }} />
          </Stack>
        </AuthGate>
      </AppProviders>
    </GestureHandlerRootView>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === 'booting') {
      void bootstrap();
    }
  }, [bootstrap, status]);

  useEffect(() => {
    if (status === 'booting' || status === 'authenticating') return;

    const inAuthRoute = segments[0] === 'sign-in';
    const inCompleteProfile = segments[0] === 'complete-profile';
    const inTabs = segments[0] === '(tabs)';

    if (status === 'unauthenticated' && !inAuthRoute) {
      router.replace('/sign-in');
      return;
    }
    if (status === 'authenticated') {
      const profileComplete = Boolean(user?.firstName && user?.lastName);
      if (!profileComplete && !inCompleteProfile) {
        router.replace('/complete-profile');
        return;
      }
      if (profileComplete && (inAuthRoute || inCompleteProfile)) {
        router.replace('/');
        return;
      }
      // Defensive: if we somehow ended up nowhere, push to tabs.
      if (
        profileComplete &&
        !inTabs &&
        segments.length > 0 &&
        !inAuthRoute &&
        !inCompleteProfile &&
        !['horses', 'boots', 'scans', 'onboarding'].includes(segments[0] ?? '')
      ) {
        router.replace('/');
      }
    }
  }, [router, segments, status, user]);

  if (status === 'booting') {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A1816',
        }}
      >
        <ActivityIndicator color="#00DDA8" />
      </View>
    );
  }
  return <>{children}</>;
}
