import { router } from 'expo-router';
import { Alert, Pressable, ScrollView } from 'react-native';
import { Stack, Text, XStack, YStack } from 'tamagui';

import { apiRequest } from '@/api/client';
import { useAuthStore } from '@/auth';
import {
  type HeightUnit,
  type TempUnit,
  type ThemePref,
  type WeightUnit,
  usePrefsStore,
} from '@/prefs/store';

export default function AccountScreen() {
  const user = useAuthStore((s) => s.user);
  const memberships = useAuthStore((s) => s.memberships);
  const signOut = useAuthStore((s) => s.signOut);

  const theme = usePrefsStore((s) => s.theme);
  const tempUnit = usePrefsStore((s) => s.tempUnit);
  const heightUnit = usePrefsStore((s) => s.heightUnit);
  const weightUnit = usePrefsStore((s) => s.weightUnit);
  const setTheme = usePrefsStore((s) => s.setTheme);
  const setTempUnit = usePrefsStore((s) => s.setTempUnit);
  const setHeightUnit = usePrefsStore((s) => s.setHeightUnit);
  const setWeightUnit = usePrefsStore((s) => s.setWeightUnit);

  const handleSignOut = () => {
    Alert.alert('Sign out?', 'You can sign back in any time.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/sign-in');
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete account?',
      'Your data is held for 60 days, then permanently deleted. You can recover the account during that window from a confirmation email.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await apiRequest('/v1/me', { method: 'DELETE' });
            if (!result.ok) {
              Alert.alert(
                'Could not delete',
                result.message || 'Try again or contact support.',
              );
              return;
            }
            await signOut();
            router.replace('/sign-in');
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0A1816' }}>
      <YStack padding="$5" gap="$5">
        <YStack gap="$2">
          <Text color="$colorMuted" fontSize={12} letterSpacing={2}>
            ACCOUNT
          </Text>
          <Text color="$color" fontSize={28} fontWeight="700">
            {user?.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : 'You'}
          </Text>
          <Text color="$colorSecondary" fontSize={14}>
            {user?.email ?? user?.cognitoSub ?? '—'}
          </Text>
          {memberships[0]?.organizationName && (
            <Text color="$colorMuted" fontSize={12}>
              {memberships[0].organizationName} · {memberships[0].role}
            </Text>
          )}
        </YStack>

        <Section title="Theme">
          <SegmentRow<ThemePref>
            options={[
              { value: 'system', label: 'OS' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
            value={theme}
            onChange={(v) => void setTheme(v)}
          />
        </Section>

        <Section title="Temperature">
          <SegmentRow<TempUnit>
            options={[
              { value: 'F', label: '°F' },
              { value: 'C', label: '°C' },
            ]}
            value={tempUnit}
            onChange={(v) => void setTempUnit(v)}
          />
        </Section>

        <Section title="Height">
          <SegmentRow<HeightUnit>
            options={[
              { value: 'hands', label: 'Hands' },
              { value: 'cm', label: 'Centimetres' },
            ]}
            value={heightUnit}
            onChange={(v) => void setHeightUnit(v)}
          />
        </Section>

        <Section title="Weight">
          <SegmentRow<WeightUnit>
            options={[
              { value: 'lbs', label: 'Pounds' },
              { value: 'kg', label: 'Kilograms' },
            ]}
            value={weightUnit}
            onChange={(v) => void setWeightUnit(v)}
          />
        </Section>

        <Pressable accessibilityRole="button" onPress={handleSignOut} hitSlop={8}>
          <Stack
            backgroundColor="$backgroundCard"
            borderColor="$borderColor"
            borderWidth={1}
            borderRadius="$pill"
            paddingVertical="$3"
            paddingHorizontal="$5"
            alignItems="center"
            minHeight={48}
          >
            <Text color="$color" fontSize={14} fontWeight="600">
              Sign out
            </Text>
          </Stack>
        </Pressable>

        <Pressable accessibilityRole="button" onPress={handleDelete} hitSlop={8}>
          <Stack
            backgroundColor="transparent"
            borderColor="$tempHigh"
            borderWidth={1}
            borderRadius="$pill"
            paddingVertical="$3"
            paddingHorizontal="$5"
            alignItems="center"
            minHeight={48}
          >
            <Text color="$tempHigh" fontSize={14} fontWeight="600">
              Delete account
            </Text>
          </Stack>
        </Pressable>

        <Stack
          backgroundColor="$backgroundCard"
          borderRadius="$lg"
          borderWidth={1}
          borderColor="$borderColor"
          padding="$4"
          gap="$1"
        >
          <Text color="$colorMuted" fontSize={11} letterSpacing={1.5}>
            ABOUT
          </Text>
          <Text color="$colorSecondary" fontSize={13}>
            B-Sure 0.1.0 · Made by Petaluma. Non-diagnostic. Always consult
            your vet for medical concerns.
          </Text>
        </Stack>

        <Stack height={48} />
      </YStack>
    </ScrollView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <YStack gap="$2">
      <Text color="$colorMuted" fontSize={11} letterSpacing={1.5}>
        {title.toUpperCase()}
      </Text>
      {children}
    </YStack>
  );
}

type SegmentRowProps<T extends string> = {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (next: T) => void;
};

function SegmentRow<T extends string>({
  options,
  value,
  onChange,
}: SegmentRowProps<T>) {
  return (
    <XStack gap="$2">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(opt.value)}
            hitSlop={8}
            style={{ flex: 1 }}
          >
            <Stack
              backgroundColor={selected ? '$primary' : '$backgroundCard'}
              borderColor={selected ? '$primary' : '$borderColor'}
              borderWidth={1}
              borderRadius="$pill"
              paddingVertical="$3"
              alignItems="center"
              justifyContent="center"
              minHeight={44}
            >
              <Text
                color={selected ? '#0A1816' : '$color'}
                fontSize={13}
                fontWeight="600"
              >
                {opt.label}
              </Text>
            </Stack>
          </Pressable>
        );
      })}
    </XStack>
  );
}
