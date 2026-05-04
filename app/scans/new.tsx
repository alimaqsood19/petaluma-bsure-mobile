/**
 * Scan capture flow — five-step pattern per F6.1.
 *
 * One screen, phase-driven by useCaptureStore. Phases:
 *   pick-horse → pick-boot → connecting → measuring → measured →
 *   details → saving → done | error
 *
 * Pick-horse is skipped if `?horseId=` is present in the route (from
 * the horse-profile "Start scan" CTA). Quick Read (T1.24) starts here
 * with `?unassigned=1`.
 */

import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { Input, Stack, Text, XStack, YStack } from 'tamagui';

import { useAuthStore } from '@/auth';
import { BluetoothRequired } from '@/ble/BluetoothRequired';
import { BootPicker } from '@/ble/BootPicker';
import { useAdjacencyStore } from '@/ble/adjacency';
import { useBleStore } from '@/ble/store';
import { listBoots } from '@/db/repositories/boots';
import { useCaptureStore } from '@/scans/captureStore';
import { useEffectOnce } from '@/util/useEffectOnce';
import { useState } from 'react';

import type { Leg } from '@/db/schemas';

const LEGS: Leg[] = ['FL', 'FR', 'BL', 'BR'];
const ACTIVITY_TYPES = ['Walk', 'Trot', 'Canter', 'Hack', 'Jump', 'Lunge'];
const FOOTINGS = ['Sand', 'Grass', 'Dirt', 'Indoor', 'Trail'];

export default function NewScanScreen() {
  const params = useLocalSearchParams<{
    horseId?: string;
    unassigned?: string;
  }>();
  const startWithHorse =
    typeof params.horseId === 'string' ? params.horseId : null;
  const startUnassigned = params.unassigned === '1';

  const blePerm = useBleStore((s) => s.status);
  const refreshBlePerm = useBleStore((s) => s.refresh);
  const startAdjacency = useAdjacencyStore((s) => s.startScan);
  const stopAdjacency = useAdjacencyStore((s) => s.stopScan);

  const captureStep = useCaptureStore((s) => s.step);
  const captureLeg = useCaptureStore((s) => s.leg);
  const captureError = useCaptureStore((s) => s.error);
  const start = useCaptureStore((s) => s.start);
  const pickBoot = useCaptureStore((s) => s.pickBoot);
  const setLeg = useCaptureStore((s) => s.setLeg);
  const setActivity = useCaptureStore((s) => s.setActivity);
  const save = useCaptureStore((s) => s.save);
  const reset = useCaptureStore((s) => s.reset);

  const memberships = useAuthStore((s) => s.memberships);
  const orgId = memberships[0]?.organizationId;

  const [pairedBoots, setPairedBoots] = useState<
    Array<{ id: string; serial: string; name?: string; lastBatteryPct?: number | null }>
  >([]);

  // Initialize the capture machine once.
  useEffectOnce(() => {
    start({
      horseId: startWithHorse,
      unassigned: startUnassigned || startWithHorse === null,
    });
  });

  // Load paired boots from Realm + start adjacency scan when picking a boot.
  useEffect(() => {
    if (captureStep !== 'pick-boot') return;
    if (!orgId) return;
    void refreshBlePerm();
    (async () => {
      try {
        const boots = (await listBoots(orgId)) as Array<Record<string, unknown>>;
        setPairedBoots(
          boots.map((b) => ({
            id: String(b.id),
            serial: String(b.serial),
            name: typeof b.name === 'string' ? b.name : undefined,
            lastBatteryPct:
              typeof b.lastBatteryPct === 'number'
                ? b.lastBatteryPct
                : undefined,
          })),
        );
      } catch {
        // Realm not available (Expo Go) — paired list will be empty.
      }
    })();
    if (blePerm === 'granted') void startAdjacency();
    return () => {
      void stopAdjacency();
    };
  }, [captureStep, orgId, blePerm, refreshBlePerm, startAdjacency, stopAdjacency]);

  if (captureStep === 'pick-boot' && blePerm !== 'granted') {
    return <BluetoothRequired status={blePerm} />;
  }

  if (captureStep === 'done') {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#0A1816' }}>
        <YStack padding="$5" gap="$5" alignItems="flex-start">
          <Text color="$primary" fontSize={26} fontWeight="700">
            Scan saved
          </Text>
          <Text color="$colorSecondary" fontSize={14}>
            The scan is on this device and will sync when you're online.
          </Text>
          <PrimaryButton
            label="Back to Home"
            onPress={() => {
              reset();
              router.replace('/');
            }}
          />
        </YStack>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0A1816' }}
      keyboardShouldPersistTaps="handled"
    >
      <YStack padding="$5" gap="$5">
        <YStack gap="$2">
          <Text color="$colorMuted" fontSize={12} letterSpacing={2}>
            STEP {stepNumber(captureStep)} OF 5
          </Text>
          <Text color="$color" fontSize={26} fontWeight="700">
            {stepTitle(captureStep)}
          </Text>
          <Text color="$colorSecondary" fontSize={14} lineHeight={20}>
            {stepBody(captureStep)}
          </Text>
        </YStack>

        {captureStep === 'pick-boot' && (
          <BootPicker
            paired={pairedBoots}
            onPick={(entry) => {
              if (!entry.inRange || !entry.advertisedDeviceId) return;
              void pickBoot({
                bootId: entry.paired.id,
                deviceId: entry.advertisedDeviceId,
              });
            }}
          />
        )}

        {(captureStep === 'connecting' || captureStep === 'measuring') && (
          <YStack gap="$3">
            <XStack gap="$2" alignItems="center">
              <ActivityIndicator color="#00DDA8" />
              <Text color="$colorSecondary" fontSize={13}>
                {captureStep === 'connecting'
                  ? 'Connecting to the boot…'
                  : 'Capturing 184 readings…'}
              </Text>
            </XStack>
            <Stack
              backgroundColor="$backgroundCard"
              borderRadius="$lg"
              borderWidth={1}
              borderColor="$borderColor"
              padding="$3"
            >
              <Text color="$colorMuted" fontSize={12}>
                Hold the boot still on the leg. The reading takes a few seconds.
              </Text>
            </Stack>
          </YStack>
        )}

        {(captureStep === 'measured' || captureStep === 'details' || captureStep === 'saving') && (
          <ActivityForm
            captureLeg={captureLeg}
            onSubmit={async () => {
              const result = await save();
              if (!result.ok && result.error) {
                // error state is set in the store
              }
            }}
            saving={captureStep === 'saving'}
            setLeg={setLeg}
            setActivity={setActivity}
          />
        )}

        {captureStep === 'error' && captureError && (
          <YStack gap="$3">
            <Stack backgroundColor="#3A1F1F" borderRadius="$md" padding="$3">
              <Text color="#FF8A8A" fontSize={13}>
                {captureError.message}
              </Text>
            </Stack>
            <PrimaryButton
              label="Try again"
              onPress={() => {
                reset();
                start({
                  horseId: startWithHorse,
                  unassigned: startUnassigned || startWithHorse === null,
                });
              }}
            />
          </YStack>
        )}
      </YStack>
    </ScrollView>
  );
}

function ActivityForm({
  captureLeg,
  setLeg,
  setActivity,
  onSubmit,
  saving,
}: {
  captureLeg: Leg;
  setLeg: (leg: Leg) => void;
  setActivity: (a: Partial<{
    activityType: string;
    intensity: number | null;
    durationMinutes: number | null;
    footing: string;
    notes: string;
  }>) => void;
  onSubmit: () => Promise<void>;
  saving: boolean;
}) {
  const [activityType, setLocalActivity] = useState('');
  const [intensity, setLocalIntensity] = useState('');
  const [duration, setLocalDuration] = useState('');
  const [footing, setLocalFooting] = useState('');
  const [notes, setLocalNotes] = useState('');

  return (
    <YStack gap="$3">
      <YStack gap="$2">
        <Text color="$color" fontSize={13} fontWeight="600">
          Leg
        </Text>
        <XStack gap="$2">
          {LEGS.map((leg) => {
            const selected = captureLeg === leg;
            return (
              <Pressable
                key={leg}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setLeg(leg)}
                hitSlop={8}
              >
                <Stack
                  backgroundColor={selected ? '$primary' : '$backgroundCard'}
                  borderColor={selected ? '$primary' : '$borderColor'}
                  borderWidth={1}
                  borderRadius="$pill"
                  paddingHorizontal="$4"
                  paddingVertical="$3"
                  minWidth={56}
                  alignItems="center"
                  minHeight={44}
                  justifyContent="center"
                >
                  <Text
                    color={selected ? '#0A1816' : '$color'}
                    fontWeight="600"
                  >
                    {leg}
                  </Text>
                </Stack>
              </Pressable>
            );
          })}
        </XStack>
      </YStack>

      <YStack gap="$2">
        <Text color="$color" fontSize={13} fontWeight="600">
          Activity (optional)
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$2">
            {ACTIVITY_TYPES.map((a) => {
              const selected = activityType === a;
              return (
                <Pressable
                  key={a}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    const next = selected ? '' : a;
                    setLocalActivity(next);
                    setActivity({ activityType: next });
                  }}
                  hitSlop={8}
                >
                  <Stack
                    backgroundColor={selected ? '$primary' : '$backgroundCard'}
                    borderColor={selected ? '$primary' : '$borderColor'}
                    borderWidth={1}
                    borderRadius="$pill"
                    paddingHorizontal="$4"
                    paddingVertical="$3"
                    minHeight={44}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text
                      color={selected ? '#0A1816' : '$color'}
                      fontSize={13}
                      fontWeight="600"
                    >
                      {a}
                    </Text>
                  </Stack>
                </Pressable>
              );
            })}
          </XStack>
        </ScrollView>
      </YStack>

      <XStack gap="$3">
        <YStack gap="$2" flex={1}>
          <Text color="$color" fontSize={13} fontWeight="600">
            Intensity (0–1)
          </Text>
          <Input
            value={intensity}
            onChangeText={(v) => {
              setLocalIntensity(v);
              const n = Number(v);
              setActivity({
                intensity: Number.isFinite(n) && v.length > 0 ? n : null,
              });
            }}
            keyboardType="decimal-pad"
            placeholder="0.7"
            backgroundColor="$backgroundCard"
            borderColor="$borderColor"
            color="$color"
            placeholderTextColor="$colorMuted"
          />
        </YStack>
        <YStack gap="$2" flex={1}>
          <Text color="$color" fontSize={13} fontWeight="600">
            Duration (min)
          </Text>
          <Input
            value={duration}
            onChangeText={(v) => {
              setLocalDuration(v);
              const n = Number(v);
              setActivity({
                durationMinutes: Number.isFinite(n) && v.length > 0 ? n : null,
              });
            }}
            keyboardType="number-pad"
            placeholder="45"
            backgroundColor="$backgroundCard"
            borderColor="$borderColor"
            color="$color"
            placeholderTextColor="$colorMuted"
          />
        </YStack>
      </XStack>

      <YStack gap="$2">
        <Text color="$color" fontSize={13} fontWeight="600">
          Footing
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$2">
            {FOOTINGS.map((f) => {
              const selected = footing === f;
              return (
                <Pressable
                  key={f}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    const next = selected ? '' : f;
                    setLocalFooting(next);
                    setActivity({ footing: next });
                  }}
                  hitSlop={8}
                >
                  <Stack
                    backgroundColor={selected ? '$primary' : '$backgroundCard'}
                    borderColor={selected ? '$primary' : '$borderColor'}
                    borderWidth={1}
                    borderRadius="$pill"
                    paddingHorizontal="$4"
                    paddingVertical="$3"
                    minHeight={44}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text
                      color={selected ? '#0A1816' : '$color'}
                      fontSize={13}
                      fontWeight="600"
                    >
                      {f}
                    </Text>
                  </Stack>
                </Pressable>
              );
            })}
          </XStack>
        </ScrollView>
      </YStack>

      <YStack gap="$2">
        <Text color="$color" fontSize={13} fontWeight="600">
          Notes
        </Text>
        <Input
          value={notes}
          onChangeText={(v) => {
            setLocalNotes(v);
            setActivity({ notes: v });
          }}
          placeholder="optional context"
          multiline
          numberOfLines={3}
          backgroundColor="$backgroundCard"
          borderColor="$borderColor"
          color="$color"
          placeholderTextColor="$colorMuted"
        />
      </YStack>

      <PrimaryButton
        label={saving ? 'Saving…' : 'Save scan'}
        onPress={() => {
          void onSubmit();
        }}
        disabled={saving}
        loading={saving}
      />
    </YStack>
  );
}

function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
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

function stepNumber(step: string): number {
  switch (step) {
    case 'pick-horse':
      return 1;
    case 'pick-boot':
      return 2;
    case 'connecting':
    case 'measuring':
    case 'measured':
      return 3;
    case 'details':
      return 4;
    case 'saving':
    case 'done':
      return 5;
    default:
      return 0;
  }
}
function stepTitle(step: string): string {
  switch (step) {
    case 'pick-horse':
      return 'Pick a horse';
    case 'pick-boot':
      return 'Pick a boot';
    case 'connecting':
      return 'Connecting…';
    case 'measuring':
      return 'Capturing 184 readings…';
    case 'measured':
    case 'details':
      return 'Add context';
    case 'saving':
      return 'Saving…';
    case 'done':
      return 'Saved';
    default:
      return 'New scan';
  }
}
function stepBody(step: string): string {
  switch (step) {
    case 'pick-horse':
      return 'Choose a horse to attach this scan to.';
    case 'pick-boot':
      return 'Choose the boot you\'re scanning with.';
    case 'measuring':
      return 'Hold the boot still on the leg.';
    case 'measured':
    case 'details':
      return 'Tell us what they were doing — all fields are optional except leg.';
    case 'saving':
      return 'Writing locally and to the cloud.';
    default:
      return '';
  }
}
