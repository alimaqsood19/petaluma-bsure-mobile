import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { Stack, Text, XStack, YStack } from 'tamagui';

import { useAuthStore } from '@/auth';
import { BluetoothRequired } from '@/ble/BluetoothRequired';
import { useBleStore } from '@/ble/store';
import { listUnassignedScans } from '@/db/repositories/scans';

export default function QuickReadScreen() {
  const status = useBleStore((s) => s.status);
  const refresh = useBleStore((s) => s.refresh);

  const memberships = useAuthStore((s) => s.memberships);
  const orgId = memberships[0]?.organizationId;
  const [unassignedCount, setUnassignedCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;
    (async () => {
      try {
        const scans = await listUnassignedScans(orgId);
        if (!cancelled) setUnassignedCount(scans.length);
      } catch {
        // Realm not available — leave count at 0.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orgId, status]);

  if (status !== 'granted') {
    return <BluetoothRequired status={status} />;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0A1816' }}>
      <YStack padding="$5" gap="$5">
        <YStack gap="$2">
          <Text color="$colorMuted" fontSize={12} letterSpacing={2}>
            QUICK READ
          </Text>
          <Text color="$color" fontSize={28} fontWeight="700">
            Scan now, assign later
          </Text>
          <Text color="$colorSecondary" fontSize={14} lineHeight={20}>
            Capture a reading without picking a horse first. Useful when the
            horse is unfamiliar or the moment is short — you'll attach it to
            the right horse from Manage Data later.
          </Text>
        </YStack>

        <Link href="/scans/new?unassigned=1" asChild>
          <Pressable accessibilityRole="button" hitSlop={8}>
            <Stack
              backgroundColor="$primary"
              borderRadius="$pill"
              paddingVertical="$4"
              paddingHorizontal="$5"
              alignItems="center"
              minHeight={52}
            >
              <Text color="#0A1816" fontSize={15} fontWeight="700">
                Start a Quick Read
              </Text>
            </Stack>
          </Pressable>
        </Link>

        {unassignedCount > 0 && (
          <Link href="/scans/unassigned" asChild>
            <Pressable accessibilityRole="button" hitSlop={8}>
              <Stack
                backgroundColor="$backgroundCard"
                borderColor="$tempMed"
                borderWidth={1}
                borderRadius="$lg"
                padding="$4"
                gap="$2"
              >
                <XStack alignItems="center" justifyContent="space-between">
                  <Text color="$color" fontSize={14} fontWeight="600">
                    {unassignedCount} unassigned scan
                    {unassignedCount === 1 ? '' : 's'}
                  </Text>
                  <Text color="$tempMed" fontSize={11} fontWeight="700" letterSpacing={1}>
                    REVIEW →
                  </Text>
                </XStack>
                <Text color="$colorSecondary" fontSize={12}>
                  Pick a horse for each so its history reflects the reading.
                </Text>
              </Stack>
            </Pressable>
          </Link>
        )}

        <Stack
          backgroundColor="$backgroundCard"
          borderRadius="$lg"
          borderWidth={1}
          borderColor="$borderColor"
          padding="$4"
          gap="$2"
        >
          <Text color="$colorMuted" fontSize={11} letterSpacing={1.5}>
            HOW IT WORKS
          </Text>
          <Text color="$colorSecondary" fontSize={13} lineHeight={18}>
            1. Tap Start a Quick Read.{'\n'}
            2. Pick the boot you're scanning with.{'\n'}
            3. Capture 184 readings.{'\n'}
            4. Add activity notes (optional).{'\n'}
            5. Save — the scan lands in your Unassigned list.{'\n'}
            6. Open the list later and assign each scan to a horse.
          </Text>
        </Stack>
      </YStack>
    </ScrollView>
  );
}
