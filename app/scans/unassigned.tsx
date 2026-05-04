/**
 * Unassigned scans — Quick Read landing zone (F6.4).
 *
 * Lists scans where horseId is null. Tapping one opens a horse picker;
 * picking a horse calls `assignScanToHorse` which flips horseId +
 * unassigned=false + localDirty=true. The next sync push (T1.25) writes
 * the assignment server-side.
 */

import { router, Stack as RouterStack, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { Stack, Text, XStack, YStack } from 'tamagui';

import { useAuthStore } from '@/auth';
import { listHorses } from '@/db/repositories/horses';
import {
  assignScanToHorse,
  listUnassignedScans,
} from '@/db/repositories/scans';

type ScanRow = {
  id: string;
  capturedAt: Date;
  leg: string;
  bootId?: string;
  notes?: string;
};

type HorseRow = {
  id: string;
  name: string;
  discipline?: string;
};

export default function UnassignedScansScreen() {
  const memberships = useAuthStore((s) => s.memberships);
  const orgId = memberships[0]?.organizationId;

  const [scans, setScans] = useState<ScanRow[]>([]);
  const [horses, setHorses] = useState<HorseRow[]>([]);
  const [pickingFor, setPickingFor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    try {
      const [s, h] = await Promise.all([
        listUnassignedScans(orgId),
        listHorses(orgId),
      ]);
      setScans(
        (s as Array<Record<string, unknown>>).map((r) => ({
          id: String(r.id),
          capturedAt:
            r.capturedAt instanceof Date ? r.capturedAt : new Date(),
          leg: String(r.leg ?? ''),
          bootId: typeof r.bootId === 'string' ? r.bootId : undefined,
          notes: typeof r.notes === 'string' ? r.notes : undefined,
        })),
      );
      setHorses(
        (h as Array<Record<string, unknown>>).map((r) => ({
          id: String(r.id),
          name: String(r.name ?? ''),
          discipline:
            typeof r.discipline === 'string' ? r.discipline : undefined,
        })),
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Could not load unassigned scans.',
      );
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onAssign = async (scanId: string, horseId: string) => {
    try {
      await assignScanToHorse(scanId, horseId);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Could not assign the scan.',
      );
      return;
    }
    setPickingFor(null);
    await refresh();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0A1816' }}>
      <RouterStack.Screen options={{ title: 'Unassigned scans' }} />
      <YStack padding="$5" gap="$5">
        <YStack gap="$2">
          <Text color="$colorMuted" fontSize={12} letterSpacing={2}>
            UNASSIGNED SCANS
          </Text>
          <Text color="$color" fontSize={26} fontWeight="700">
            {scans.length === 0 ? 'Nothing to assign' : `${scans.length} to assign`}
          </Text>
          <Text color="$colorSecondary" fontSize={14}>
            Quick Reads land here. Pick a horse for each so its scan history
            reflects the reading.
          </Text>
        </YStack>

        {loading && (
          <XStack gap="$2" alignItems="center">
            <ActivityIndicator color="#00DDA8" />
            <Text color="$colorSecondary" fontSize={13}>
              Loading scans…
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

        {scans.length === 0 && !loading && (
          <Stack
            backgroundColor="$backgroundCard"
            borderRadius="$lg"
            borderWidth={1}
            borderColor="$borderColor"
            padding="$4"
            gap="$2"
          >
            <Text color="$color" fontSize={14} fontWeight="600">
              All caught up
            </Text>
            <Text color="$colorSecondary" fontSize={13}>
              All your Quick Reads are assigned to horses.
            </Text>
            <Pressable accessibilityRole="button" onPress={() => router.replace('/')}>
              <Text color="$primary" fontSize={13} fontWeight="600" marginTop="$2">
                Back to Home
              </Text>
            </Pressable>
          </Stack>
        )}

        {scans.map((scan) => (
          <Stack
            key={scan.id}
            backgroundColor="$backgroundCard"
            borderRadius="$lg"
            borderWidth={1}
            borderColor="$borderColor"
            padding="$4"
            gap="$3"
          >
            <YStack gap="$1">
              <Text color="$color" fontSize={14} fontWeight="600">
                {scan.leg} · {scan.capturedAt.toLocaleString()}
              </Text>
              {scan.notes && (
                <Text color="$colorSecondary" fontSize={12}>
                  {scan.notes}
                </Text>
              )}
            </YStack>

            {pickingFor === scan.id ? (
              <YStack gap="$2">
                {horses.length === 0 ? (
                  <Text color="$colorMuted" fontSize={12}>
                    No horses yet — add one from Home.
                  </Text>
                ) : (
                  horses.map((h) => (
                    <Pressable
                      key={h.id}
                      accessibilityRole="button"
                      onPress={() => void onAssign(scan.id, h.id)}
                      hitSlop={8}
                    >
                      <XStack
                        backgroundColor="$backgroundAlt"
                        borderRadius="$pill"
                        paddingHorizontal="$4"
                        paddingVertical="$3"
                        alignItems="center"
                        justifyContent="space-between"
                        minHeight={44}
                      >
                        <Text color="$color" fontSize={14} fontWeight="600">
                          {h.name}
                        </Text>
                        {h.discipline && (
                          <Text color="$colorMuted" fontSize={12}>
                            {h.discipline}
                          </Text>
                        )}
                      </XStack>
                    </Pressable>
                  ))
                )}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setPickingFor(null)}
                  hitSlop={8}
                >
                  <Text color="$colorMuted" fontSize={13}>
                    Cancel
                  </Text>
                </Pressable>
              </YStack>
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={() => setPickingFor(scan.id)}
                hitSlop={8}
              >
                <Stack
                  backgroundColor="$primary"
                  borderRadius="$pill"
                  paddingHorizontal="$4"
                  paddingVertical="$3"
                  alignItems="center"
                  minHeight={44}
                >
                  <Text color="#0A1816" fontSize={13} fontWeight="700">
                    Assign to a horse
                  </Text>
                </Stack>
              </Pressable>
            )}
          </Stack>
        ))}
      </YStack>
    </ScrollView>
  );
}
