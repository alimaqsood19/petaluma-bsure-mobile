import { Link, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { Stack, Text, XStack, YStack } from 'tamagui';

import { useAuthStore } from '@/auth';
import { getHorse } from '@/db/repositories/horses';
import { profileCompletionPct } from '@/horses/profile-completion';

type HorseSnapshot = {
  id: string;
  name: string;
  breed?: string;
  discipline?: string;
  ownerName?: string;
  trainerName?: string;
  heightHands?: number;
  weightLbs?: number;
  age?: number;
  sex?: string;
  color?: string;
  uniqueMarkings?: string;
  contactInfo?: string;
  photoUrl?: string;
  organizationId: string;
  createdAt: Date;
};

export default function HorseProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const memberships = useAuthStore((s) => s.memberships);
  const orgName =
    memberships.find((m) => m.organizationId === '__active__')?.organizationName ??
    memberships[0]?.organizationName ??
    'Your barn';

  const [horse, setHorse] = useState<HorseSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await getHorse(String(id));
        if (cancelled) return;
        setHorse(raw ? toSnapshot(raw) : null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Could not load horse.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#0A1816' }}>
        <YStack padding="$5" gap="$3" alignItems="center">
          <ActivityIndicator color="#00DDA8" />
          <Text color="$colorSecondary" fontSize={13}>
            Loading horse…
          </Text>
        </YStack>
      </ScrollView>
    );
  }

  if (error || !horse) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#0A1816' }}>
        <YStack padding="$5" gap="$3">
          <Text color="$color" fontSize={20} fontWeight="600">
            Horse not found
          </Text>
          <Text color="$colorSecondary" fontSize={13}>
            {error ?? 'This horse may have been archived or removed.'}
          </Text>
          <Pressable accessibilityRole="button" onPress={() => router.replace('/')}>
            <Stack
              backgroundColor="$primary"
              borderRadius="$pill"
              paddingVertical="$3"
              paddingHorizontal="$5"
              alignItems="center"
              minHeight={48}
            >
              <Text color="#0A1816" fontWeight="700">
                Back to Home
              </Text>
            </Stack>
          </Pressable>
        </YStack>
      </ScrollView>
    );
  }

  const completion = profileCompletionPct(horse);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0A1816' }}>
      <YStack padding="$5" gap="$5">
        <YStack gap="$2">
          <Text color="$colorMuted" fontSize={12} letterSpacing={2}>
            HORSE
          </Text>
          <Text color="$color" fontSize={32} fontWeight="700">
            {horse.name}
          </Text>
          <Text color="$colorSecondary" fontSize={14}>
            {orgName}
            {horse.discipline ? ` · ${horse.discipline}` : ''}
          </Text>
        </YStack>

        <Stack
          backgroundColor="$backgroundCard"
          borderRadius="$lg"
          borderWidth={1}
          borderColor="$borderColor"
          padding="$4"
          gap="$2"
        >
          <Text color="$colorMuted" fontSize={11} letterSpacing={1.5}>
            PROFILE COMPLETENESS
          </Text>
          <XStack alignItems="baseline" gap="$2">
            <Text color="$color" fontSize={28} fontWeight="700">
              {completion}%
            </Text>
            <Text color="$colorSecondary" fontSize={13}>
              {completion < 100 ? 'Add more details to fill it out.' : 'Complete'}
            </Text>
          </XStack>
        </Stack>

        <Stack
          backgroundColor="$backgroundCard"
          borderRadius="$lg"
          borderWidth={1}
          borderColor="$borderColor"
          padding="$4"
          gap="$2"
        >
          <Text color="$colorMuted" fontSize={11} letterSpacing={1.5}>
            BASIC INFO
          </Text>
          <Field label="Breed" value={horse.breed} />
          <Field label="Discipline" value={horse.discipline} />
          <Field label="Sex" value={horse.sex} />
          <Field
            label="Height"
            value={horse.heightHands ? `${horse.heightHands} hands` : undefined}
          />
          <Field
            label="Weight"
            value={horse.weightLbs ? `${horse.weightLbs} lbs` : undefined}
          />
          <Field label="Age" value={horse.age ? `${horse.age} years` : undefined} />
          <Field label="Color" value={horse.color} />
          <Field label="Markings" value={horse.uniqueMarkings} />
        </Stack>

        <Stack
          backgroundColor="$backgroundCard"
          borderRadius="$lg"
          borderWidth={1}
          borderColor="$borderColor"
          padding="$4"
          gap="$2"
        >
          <Text color="$colorMuted" fontSize={11} letterSpacing={1.5}>
            PEOPLE
          </Text>
          <Field label="Owner" value={horse.ownerName} />
          <Field label="Trainer" value={horse.trainerName} />
          <Field label="Contact" value={horse.contactInfo} />
        </Stack>

        <Link href={`/scans/new?horseId=${horse.id}`} asChild>
          <Pressable accessibilityRole="button" hitSlop={8}>
            <Stack
              backgroundColor="$primary"
              borderRadius="$pill"
              paddingVertical="$3"
              paddingHorizontal="$5"
              alignItems="center"
              minHeight={48}
            >
              <Text color="#0A1816" fontSize={15} fontWeight="700">
                Start a scan
              </Text>
            </Stack>
          </Pressable>
        </Link>

        <Link href={`/horses/${horse.id}/edit`} asChild>
          <Pressable accessibilityRole="button" hitSlop={8}>
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
                Edit horse
              </Text>
            </Stack>
          </Pressable>
        </Link>
      </YStack>
    </ScrollView>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) {
    return (
      <XStack justifyContent="space-between">
        <Text color="$colorMuted" fontSize={13}>
          {label}
        </Text>
        <Text color="$colorMuted" fontSize={13}>
          —
        </Text>
      </XStack>
    );
  }
  return (
    <XStack justifyContent="space-between" alignItems="baseline">
      <Text color="$colorMuted" fontSize={13}>
        {label}
      </Text>
      <Text color="$color" fontSize={14} fontWeight="500" maxWidth="60%" textAlign="right">
        {value}
      </Text>
    </XStack>
  );
}

function toSnapshot(raw: unknown): HorseSnapshot {
  const r = raw as Record<string, unknown>;
  const orgId = String(r.organizationId);
  return {
    id: String(r.id),
    organizationId: orgId,
    name: String(r.name ?? ''),
    breed: optString(r.breed),
    discipline: optString(r.discipline),
    ownerName: optString(r.ownerName),
    trainerName: optString(r.trainerName),
    heightHands: optNumber(r.heightHands),
    weightLbs: optNumber(r.weightLbs),
    age: optNumber(r.age),
    sex: optString(r.sex),
    color: optString(r.color),
    uniqueMarkings: optString(r.uniqueMarkings),
    contactInfo: optString(r.contactInfo),
    photoUrl: optString(r.photoUrl),
    createdAt: r.createdAt instanceof Date ? r.createdAt : new Date(),
  };
}

function optString(v: unknown): string | undefined {
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}
function optNumber(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}
