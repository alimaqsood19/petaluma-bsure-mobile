import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView } from 'react-native';
import { Input, Stack, Text, XStack, YStack } from 'tamagui';

import { COGNITO_POOL_READY, signInWithProvider, useAuthStore } from '@/auth';

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function SignInScreen() {
  const status = useAuthStore((s) => s.status);
  const lastError = useAuthStore((s) => s.lastError);
  const isAuthenticating = status === 'authenticating';

  const [email, setEmail] = useState('');

  const handleProvider = async (provider: 'apple' | 'google') => {
    if (!COGNITO_POOL_READY) {
      Alert.alert(
        'Using LOCAL_DEV stub',
        `Cognito pool isn't provisioned yet (T1.01.6 pending). Signing in as a dev user via the LOCAL_DEV bearer per ADR 0021.\n\nAPI: ${apiUrl}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            onPress: async () => {
              const result = await signInWithProvider(provider);
              if (!result.ok) Alert.alert('Sign-in failed', result.reason);
            },
          },
        ],
      );
      return;
    }
    // Future: real native Apple/Google flow.
    const result = await signInWithProvider(provider);
    if (!result.ok) Alert.alert('Sign-in failed', result.reason);
  };

  const handleEmail = async () => {
    const seed = email.trim();
    if (seed.length === 0) {
      Alert.alert('Username required', 'Type a dev username (letters, numbers, _ or -).');
      return;
    }
    const result = await signInWithProvider('email', seed);
    if (!result.ok) Alert.alert('Sign-in failed', result.reason);
  };

  // Routing on success is handled by the root layout's redirect.
  void router;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0A1816' }}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <YStack flex={1} padding="$5" gap="$5" justifyContent="center">
        <YStack gap="$2">
          <Text color="$colorMuted" fontSize={12} letterSpacing={2}>
            B·SURE
          </Text>
          <Text color="$color" fontSize={32} fontWeight="700">
            Welcome
          </Text>
          <Text color="$colorSecondary" fontSize={15} lineHeight={22}>
            Sign in to start scanning. Your data stays on the device first and
            syncs when you have signal.
          </Text>
        </YStack>

        {!COGNITO_POOL_READY && (
          <Stack
            backgroundColor="$backgroundCard"
            borderRadius="$lg"
            borderWidth={1}
            borderColor="$borderColor"
            padding="$3"
            gap="$1"
          >
            <Text color="$primary" fontSize={11} letterSpacing={1.5} fontWeight="600">
              LOCAL_DEV MODE
            </Text>
            <Text color="$colorSecondary" fontSize={12}>
              Cognito pool is not provisioned yet (T1.01.6). All sign-in paths
              talk to the LOCAL_DEV stub at {apiUrl}.
            </Text>
          </Stack>
        )}

        <YStack gap="$3">
          <ProviderButton
            label="Continue with Apple"
            onPress={() => handleProvider('apple')}
            disabled={isAuthenticating}
            tone="primary"
          />
          <ProviderButton
            label="Continue with Google"
            onPress={() => handleProvider('google')}
            disabled={isAuthenticating}
            tone="secondary"
          />
        </YStack>

        <YStack gap="$2">
          <Text color="$colorMuted" fontSize={11} letterSpacing={1.5}>
            OR
          </Text>
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="dev username (e.g. alice)"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isAuthenticating}
            backgroundColor="$backgroundCard"
            borderColor="$borderColor"
            color="$color"
            placeholderTextColor="$colorMuted"
          />
          <ProviderButton
            label="Continue with Email"
            onPress={handleEmail}
            disabled={isAuthenticating || email.trim().length === 0}
            tone="secondary"
          />
        </YStack>

        {isAuthenticating && (
          <XStack gap="$2" alignItems="center">
            <ActivityIndicator color="#00DDA8" />
            <Text color="$colorSecondary" fontSize={13}>
              Signing in…
            </Text>
          </XStack>
        )}

        {lastError && !isAuthenticating && (
          <Stack backgroundColor="#3A1F1F" borderRadius="$md" padding="$3">
            <Text color="#FF8A8A" fontSize={13}>
              {lastError.message}
            </Text>
          </Stack>
        )}
      </YStack>
    </ScrollView>
  );
}

type ProviderButtonProps = {
  label: string;
  onPress: () => void;
  disabled: boolean;
  tone: 'primary' | 'secondary';
};

function ProviderButton({ label, onPress, disabled, tone }: ProviderButtonProps) {
  const bg = tone === 'primary' ? '$primary' : '$backgroundCard';
  const fg = tone === 'primary' ? '#0A1816' : '$color';
  const border = tone === 'primary' ? '$primary' : '$borderColor';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      <Stack
        backgroundColor={bg}
        borderColor={border}
        borderWidth={1}
        borderRadius="$pill"
        paddingVertical="$3"
        paddingHorizontal="$5"
        alignItems="center"
        justifyContent="center"
        minHeight={48}
      >
        <Text color={fg} fontSize={15} fontWeight="600">
          {label}
        </Text>
      </Stack>
    </Pressable>
  );
}
