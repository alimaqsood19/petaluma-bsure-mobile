import { Link, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { Stack, Text, XStack, YStack } from 'tamagui';

import { useAuthStore } from '@/auth';
import { useHorseStore, type HorseRecord } from '@/horses/store';

export default function HomeScreen() {
  const memberships = useAuthStore((s) => s.memberships);
  const orgId = memberships[0]?.organizationId;
  const orgName = memberships[0]?.organizationName ?? 'Your barn';

  const horses = useHorseStore((s) => s.horses);
  const loading = useHorseStore((s) => s.loading);
  const error = useHorseStore((s) => s.error);
  const refresh = useHorseStore((s) => s.refresh);

  useFocusEffect(
    useCallback(() => {
      if (orgId) void refresh(orgId);
    }, [orgId, refresh]),
  );

  const sorted = [...horses].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0A1816' }}>
      <YStack padding="$5" gap="$5">
        <YStack gap="$2">
          <Text color="$colorMuted" fontSize={12} letterSpacing={2}>
            HOME
          </Text>
          <Text color="$color" fontSize={28} fontWeight="700">
            {orgName}
          </Text>
          <Text color="$colorSecondary" fontSize={14}>
            {sorted.length === 0
              ? 'No horses yet — add your first one.'
              : `${sorted.length} horse${sorted.length === 1 ? '' : 's'}`}
          </Text>
        </YStack>

        <Link href="/horses/new" asChild>
          <Pressable accessibilityRole="button" hitSlop={8}>
            <XStack
              backgroundColor="$primary"
              borderRadius="$pill"
              paddingHorizontal="$5"
              paddingVertical="$3"
              alignItems="center"
              justifyContent="center"
              gap="$2"
              minHeight={48}
            >
              <Text color="#0A1816" fontSize={20} fontWeight="700">
                +
              </Text>
              <Text color="#0A1816" fontSize={15} fontWeight="700">
                Add a horse
              </Text>
            </XStack>
          </Pressable>
        </Link>

        {loading && horses.length === 0 && (
          <XStack gap="$2" alignItems="center">
            <ActivityIndicator color="#00DDA8" />
            <Text color="$colorSecondary" fontSize={13}>
              Loading horses…
            </Text>
          </XStack>
        )}

        {error && (
          <Stack backgroundColor="#3A1F1F" borderRadius="$md" padding="$3">
            <Text color="#FF8A8A" fontSize={13}>
              {error}
            </Text>
          </Stack>
        )}

        {sorted.length > 0 && (
          <YStack gap="$2">
            <Text color="$colorMuted" fontSize={11} letterSpacing={1.5}>
              YOUR HERD
            </Text>
            {sorted.map((h) => (
              <HorseRow key={h.id} horse={h} />
            ))}
          </YStack>
        )}

        <Link href="/boots" asChild>
          <Pressable accessibilityRole="button" hitSlop={8}>
            <Stack
              backgroundColor="$backgroundCard"
              borderColor="$borderColor"
              borderWidth={1}
              borderRadius="$lg"
              padding="$4"
              gap="$1"
            >
              <Text color="$colorMuted" fontSize={11} letterSpacing={1.5}>
                SMART BOOTS
              </Text>
              <Text color="$color" fontSize={14} fontWeight="600">
                Manage paired boots →
              </Text>
              <Text color="$colorSecondary" fontSize={12}>
                Pair a new boot, rename, or set defaults.
              </Text>
            </Stack>
          </Pressable>
        </Link>
      </YStack>
    </ScrollView>
  );
}

function HorseRow({ horse }: { horse: HorseRecord }) {
  return (
    <Link href={`/horses/${horse.id}`} asChild>
      <Pressable accessibilityRole="button" hitSlop={8}>
        <XStack
          backgroundColor="$backgroundCard"
          borderColor="$borderColor"
          borderWidth={1}
          borderRadius="$lg"
          paddingHorizontal="$4"
          paddingVertical="$3"
          alignItems="center"
          gap="$3"
          minHeight={64}
        >
          <Stack
            width={44}
            height={44}
            borderRadius="$round"
            backgroundColor="$backgroundAlt"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="$primary" fontSize={16} fontWeight="700">
              {(horse.name?.[0] ?? '?').toUpperCase()}
            </Text>
          </Stack>
          <YStack flex={1} gap="$1">
            <Text color="$color" fontSize={15} fontWeight="600">
              {horse.name}
            </Text>
            <Text color="$colorMuted" fontSize={12}>
              {[horse.discipline, horse.breed].filter(Boolean).join(' · ') ||
                'No details yet'}
            </Text>
          </YStack>
          {horse.localDirty && (
            <Stack
              backgroundColor="$tempMed"
              paddingHorizontal="$2"
              paddingVertical="$1"
              borderRadius="$pill"
            >
              <Text color="#0A1816" fontSize={10} fontWeight="700">
                UNSYNCED
              </Text>
            </Stack>
          )}
        </XStack>
      </Pressable>
    </Link>
  );
}
