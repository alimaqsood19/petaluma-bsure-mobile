import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView } from 'react-native';
import { Input, Stack, Text, XStack, YStack } from 'tamagui';

import { useAuthStore } from '@/auth';
import type { UserRole } from '@/auth/types';

const ROLE_OPTIONS: Array<{ value: UserRole; label: string; hint: string }> = [
  { value: 'rider', label: 'Rider / Owner', hint: 'I own one or more horses.' },
  { value: 'trainer', label: 'Trainer', hint: 'I train horses across one or more barns.' },
  { value: 'manager', label: 'Barn manager', hint: 'I run a stable or facility.' },
  { value: 'staff', label: 'Staff / Working student', hint: 'I help out at a barn.' },
  { value: 'vet', label: 'Veterinarian', hint: 'I review scans by invitation.' },
  { value: 'other', label: 'Other', hint: '' },
];

const DISCIPLINE_OPTIONS = [
  'Show jumping',
  'Dressage',
  'Eventing',
  'Hunter / equitation',
  'Western',
  'Trail / pleasure',
  'Endurance',
  'Racing',
  'Other',
];

export default function CompleteProfileScreen() {
  const completeProfile = useAuthStore((s) => s.completeProfile);
  const status = useAuthStore((s) => s.status);
  const isAuthenticating = status === 'authenticating';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);
  const [stableName, setStableName] = useState('');
  const [discipline, setDiscipline] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = useMemo(() => {
    return (
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      role !== null &&
      stableName.trim().length > 0
    );
  }, [firstName, lastName, role, stableName]);

  const handleSubmit = async () => {
    if (!isValid || role === null) return;
    setSubmitting(true);
    setError(null);
    const result = await completeProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role,
      stableName: stableName.trim(),
      discipline: discipline ?? undefined,
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error?.message ?? 'Could not save your profile.');
      return;
    }
    if (result.degraded) {
      Alert.alert(
        'Saved locally',
        'Your profile is saved on this device. The backend endpoints to persist it server-side are still landing — you can use the app normally and your profile will sync once they ship.',
        [{ text: 'OK', onPress: () => router.replace('/') }],
      );
    } else {
      router.replace('/');
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0A1816' }}
      keyboardShouldPersistTaps="handled"
    >
      <YStack padding="$5" gap="$5">
        <YStack gap="$2">
          <Text color="$colorMuted" fontSize={12} letterSpacing={2}>
            COMPLETE PROFILE
          </Text>
          <Text color="$color" fontSize={28} fontWeight="700">
            Tell us about you
          </Text>
          <Text color="$colorSecondary" fontSize={14} lineHeight={20}>
            We use your name on alerts and audit entries. Your stable name
            becomes your barn — you can rename it later.
          </Text>
        </YStack>

        <YStack gap="$3">
          <FieldLabel>First name</FieldLabel>
          <Input
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            autoCorrect={false}
            placeholder="e.g. Sarah"
            backgroundColor="$backgroundCard"
            borderColor="$borderColor"
            color="$color"
            placeholderTextColor="$colorMuted"
          />

          <FieldLabel>Last name</FieldLabel>
          <Input
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            autoCorrect={false}
            placeholder="e.g. Wells"
            backgroundColor="$backgroundCard"
            borderColor="$borderColor"
            color="$color"
            placeholderTextColor="$colorMuted"
          />
        </YStack>

        <YStack gap="$3">
          <FieldLabel>What brings you to B-Sure?</FieldLabel>
          <YStack gap="$2">
            {ROLE_OPTIONS.map((opt) => (
              <RolePill
                key={opt.value}
                label={opt.label}
                hint={opt.hint}
                selected={role === opt.value}
                onPress={() => setRole(opt.value)}
              />
            ))}
          </YStack>
        </YStack>

        <YStack gap="$3">
          <FieldLabel>Stable name</FieldLabel>
          <Text color="$colorMuted" fontSize={12} lineHeight={16}>
            This becomes the name of your barn. Other team members can be
            invited under it later.
          </Text>
          <Input
            value={stableName}
            onChangeText={setStableName}
            autoCapitalize="words"
            autoCorrect={false}
            placeholder="e.g. Wells Family Stables"
            backgroundColor="$backgroundCard"
            borderColor="$borderColor"
            color="$color"
            placeholderTextColor="$colorMuted"
          />
        </YStack>

        <YStack gap="$3">
          <FieldLabel>Primary discipline (optional)</FieldLabel>
          <YStack gap="$2">
            {DISCIPLINE_OPTIONS.map((d) => (
              <DisciplineRow
                key={d}
                label={d}
                selected={discipline === d}
                onPress={() => setDiscipline(discipline === d ? null : d)}
              />
            ))}
          </YStack>
        </YStack>

        {error && (
          <Stack backgroundColor="#3A1F1F" borderRadius="$md" padding="$3">
            <Text color="#FF8A8A" fontSize={13}>
              {error}
            </Text>
          </Stack>
        )}

        <SubmitButton
          label={submitting ? 'Saving…' : 'Continue to Home'}
          onPress={handleSubmit}
          disabled={!isValid || submitting || isAuthenticating}
          loading={submitting}
        />

        <Stack height={48} />
      </YStack>
    </ScrollView>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text color="$color" fontSize={13} fontWeight="600" letterSpacing={0.4}>
      {children}
    </Text>
  );
}

type RolePillProps = {
  label: string;
  hint: string;
  selected: boolean;
  onPress: () => void;
};

function RolePill({ label, hint, selected, onPress }: RolePillProps) {
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ selected }} onPress={onPress} hitSlop={8}>
      <Stack
        backgroundColor={selected ? '$primary' : '$backgroundCard'}
        borderColor={selected ? '$primary' : '$borderColor'}
        borderWidth={1}
        borderRadius="$lg"
        padding="$3"
        gap="$1"
        minHeight={56}
      >
        <Text
          color={selected ? '#0A1816' : '$color'}
          fontSize={14}
          fontWeight="600"
        >
          {label}
        </Text>
        {hint.length > 0 && (
          <Text
            color={selected ? '#0A1816' : '$colorSecondary'}
            fontSize={12}
            opacity={selected ? 0.85 : 1}
          >
            {hint}
          </Text>
        )}
      </Stack>
    </Pressable>
  );
}

type DisciplineRowProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function DisciplineRow({ label, selected, onPress }: DisciplineRowProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      hitSlop={8}
    >
      <XStack
        backgroundColor={selected ? '$primary' : '$backgroundCard'}
        borderColor={selected ? '$primary' : '$borderColor'}
        borderWidth={1}
        borderRadius="$pill"
        paddingHorizontal="$4"
        paddingVertical="$3"
        alignItems="center"
        justifyContent="space-between"
        minHeight={48}
      >
        <Text
          color={selected ? '#0A1816' : '$color'}
          fontSize={14}
          fontWeight="500"
        >
          {label}
        </Text>
        <Text
          color={selected ? '#0A1816' : '$colorMuted'}
          fontSize={12}
          fontWeight="600"
        >
          {selected ? 'SELECTED' : ''}
        </Text>
      </XStack>
    </Pressable>
  );
}

type SubmitButtonProps = {
  label: string;
  onPress: () => void;
  disabled: boolean;
  loading: boolean;
};

function SubmitButton({ label, onPress, disabled, loading }: SubmitButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      <Stack
        backgroundColor="$primary"
        borderRadius="$pill"
        paddingVertical="$4"
        paddingHorizontal="$5"
        alignItems="center"
        justifyContent="center"
        minHeight={52}
      >
        {loading ? (
          <ActivityIndicator color="#0A1816" />
        ) : (
          <Text color="#0A1816" fontSize={15} fontWeight="700">
            {label}
          </Text>
        )}
      </Stack>
    </Pressable>
  );
}
