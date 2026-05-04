import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView } from 'react-native';
import { Input, Stack, Text, XStack, YStack } from 'tamagui';

import { registerBoot } from '@/api/boots';
import { useAuthStore } from '@/auth';
import { BluetoothRequired } from '@/ble/BluetoothRequired';
import {
  type DiscoveredBoot,
  usePairingStore,
} from '@/ble/pairing';
import { useBleStore } from '@/ble/store';
import { createBoot } from '@/db/repositories/boots';

export default function PairBootScreen() {
  const blePerm = useBleStore((s) => s.status);
  const refreshPerm = useBleStore((s) => s.refresh);

  const phase = usePairingStore((s) => s.phase);
  const discovered = usePairingStore((s) => s.discovered);
  const meta = usePairingStore((s) => s.connectedMeta);
  const error = usePairingStore((s) => s.error);
  const selectedDeviceId = usePairingStore((s) => s.selectedDeviceId);
  const startScan = usePairingStore((s) => s.startScan);
  const stopScan = usePairingStore((s) => s.stopScan);
  const select = usePairingStore((s) => s.selectAndConnect);
  const reset = usePairingStore((s) => s.reset);
  const beginNaming = usePairingStore((s) => s.beginNaming);
  const beginSaving = usePairingStore((s) => s.beginSaving);
  const complete = usePairingStore((s) => s.complete);
  const setError = usePairingStore((s) => s.setError);

  const memberships = useAuthStore((s) => s.memberships);
  const orgId = memberships[0]?.organizationId;

  const [bootName, setBootName] = useState('');

  useEffect(() => {
    void refreshPerm();
  }, [refreshPerm]);

  useEffect(() => {
    if (blePerm === 'granted' && phase === 'idle') {
      void startScan();
    }
    return () => {
      if (phase === 'scanning' || phase === 'discovered') {
        void stopScan();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blePerm]);

  // Pre-fill the boot name suggestion once we have the serial.
  useEffect(() => {
    if (phase === 'connected' && meta && bootName === '') {
      setBootName(`Smart Boot ${meta.serial.slice(-4)}`);
      beginNaming();
    }
  }, [phase, meta, beginNaming, bootName]);

  if (blePerm !== 'granted') {
    return <BluetoothRequired status={blePerm} />;
  }

  const handleSave = async () => {
    if (!meta || !orgId) {
      await setError({
        code: 'unknown',
        message: !orgId
          ? 'No barn yet — finish profile completion first.'
          : 'Boot metadata missing.',
      });
      return;
    }
    beginSaving();
    try {
      // Local-first: save to Realm immediately, then attempt the API.
      await createBoot({
        organizationId: orgId,
        serial: meta.serial,
        name: bootName.trim().length > 0 ? bootName.trim() : undefined,
        firmware: meta.firmware ?? undefined,
        lastBatteryPct: meta.batteryPct ?? undefined,
      });
    } catch (e) {
      // Realm write failed — surface but allow the user to retry.
      await setError({
        code: 'unknown',
        message: e instanceof Error ? e.message : 'Could not save the boot.',
      });
      return;
    }
    const apiRes = await registerBoot({
      organizationId: orgId,
      serial: meta.serial,
      name: bootName.trim().length > 0 ? bootName.trim() : undefined,
      firmware: meta.firmware ?? undefined,
      lastBatteryPct: meta.batteryPct ?? undefined,
    });
    if (!apiRes.ok && apiRes.status !== 0) {
      // Network is the only deferrable failure; everything else (404, 5xx) is
      // surfaced. The sync engine (T1.25) will retry network failures.
      if (apiRes.code !== 'network') {
        Alert.alert(
          'Saved locally',
          `The boot is saved on this device. Server sync failed (${apiRes.message}); the next sync will retry.`,
        );
      }
    }
    complete();
    router.replace('/boots');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0A1816' }}
      keyboardShouldPersistTaps="handled"
    >
      <YStack padding="$5" gap="$5">
        <YStack gap="$2">
          <Text color="$colorMuted" fontSize={12} letterSpacing={2}>
            PAIR A SMART BOOT
          </Text>
          <Text color="$color" fontSize={26} fontWeight="700">
            {titleFor(phase)}
          </Text>
          <Text color="$colorSecondary" fontSize={14} lineHeight={20}>
            {bodyFor(phase)}
          </Text>
        </YStack>

        {phase === 'scanning' && (
          <XStack gap="$2" alignItems="center">
            <ActivityIndicator color="#00DDA8" />
            <Text color="$colorSecondary" fontSize={13}>
              Searching… make sure the boot is on and within reach.
            </Text>
          </XStack>
        )}

        {(phase === 'discovered' || phase === 'connecting') && (
          <YStack gap="$2">
            {discovered.map((b) => (
              <BootRow
                key={b.deviceId}
                boot={b}
                connecting={phase === 'connecting' && selectedDeviceId === b.deviceId}
                disabled={phase === 'connecting' && selectedDeviceId !== b.deviceId}
                onPress={() => void select(b.deviceId)}
              />
            ))}
            {discovered.length === 0 && (
              <Text color="$colorMuted" fontSize={13}>
                No boots found yet…
              </Text>
            )}
          </YStack>
        )}

        {(phase === 'connected' || phase === 'naming' || phase === 'saving') && meta && (
          <YStack gap="$3">
            <Stack
              backgroundColor="$backgroundCard"
              borderRadius="$lg"
              borderWidth={1}
              borderColor="$borderColor"
              padding="$4"
              gap="$1"
            >
              <Text color="$colorMuted" fontSize={11} letterSpacing={1.5}>
                CONNECTED
              </Text>
              <Text color="$color" fontSize={16} fontWeight="600">
                Serial {meta.serial || '—'}
              </Text>
              {meta.firmware && (
                <Text color="$colorSecondary" fontSize={13}>
                  Firmware {meta.firmware}
                </Text>
              )}
              {meta.batteryPct !== null && (
                <Text color="$colorSecondary" fontSize={13}>
                  Battery {meta.batteryPct}%
                </Text>
              )}
            </Stack>

            <YStack gap="$2">
              <Text color="$color" fontSize={13} fontWeight="600">
                Name this boot
              </Text>
              <Text color="$colorMuted" fontSize={12}>
                Persistent on this device per ADR 0009 — firmware doesn't
                store names.
              </Text>
              <Input
                value={bootName}
                onChangeText={setBootName}
                placeholder="e.g. Barn Boot 1"
                editable={phase !== 'saving'}
                backgroundColor="$backgroundCard"
                borderColor="$borderColor"
                color="$color"
                placeholderTextColor="$colorMuted"
              />
            </YStack>

            <PrimaryButton
              label={phase === 'saving' ? 'Saving…' : 'Save Boot'}
              onPress={handleSave}
              disabled={phase === 'saving' || bootName.trim().length === 0}
              loading={phase === 'saving'}
            />
          </YStack>
        )}

        {phase === 'error' && error && (
          <YStack gap="$3">
            <Stack backgroundColor="#3A1F1F" borderRadius="$md" padding="$3">
              <Text color="#FF8A8A" fontSize={13}>
                {error.message}
              </Text>
            </Stack>
            <PrimaryButton
              label="Try again"
              onPress={() => {
                void reset().then(() => void startScan());
              }}
              disabled={false}
              loading={false}
            />
          </YStack>
        )}

        {phase === 'idle' && (
          <PrimaryButton
            label="Start scanning"
            onPress={() => void startScan()}
            disabled={false}
            loading={false}
          />
        )}
      </YStack>
    </ScrollView>
  );
}

function titleFor(phase: string): string {
  switch (phase) {
    case 'idle':
      return 'Ready to pair';
    case 'scanning':
      return 'Looking for a boot';
    case 'discovered':
      return 'Pick the boot';
    case 'connecting':
      return 'Connecting…';
    case 'connected':
    case 'naming':
      return 'Name this boot';
    case 'saving':
      return 'Saving…';
    case 'error':
      return 'Something went wrong';
    default:
      return 'Pair a Smart Boot';
  }
}

function bodyFor(phase: string): string {
  switch (phase) {
    case 'idle':
      return 'Turn the boot on and tap Start scanning.';
    case 'scanning':
      return 'Listening for any Smart Boot in range.';
    case 'discovered':
      return 'Tap the boot you want to pair. If you only see one, that\'s it.';
    case 'connecting':
      return 'Reading serial, firmware and battery.';
    case 'connected':
    case 'naming':
      return 'Give it a name you\'ll recognise in the barn.';
    case 'saving':
      return 'Saving locally and to the cloud.';
    case 'error':
      return 'Tap Try again to restart.';
    default:
      return '';
  }
}

type BootRowProps = {
  boot: DiscoveredBoot;
  connecting: boolean;
  disabled: boolean;
  onPress: () => void;
};

function BootRow({ boot, connecting, disabled, onPress }: BootRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <XStack
        backgroundColor={connecting ? '$primary' : '$backgroundCard'}
        borderColor={connecting ? '$primary' : '$borderColor'}
        borderWidth={1}
        borderRadius="$lg"
        paddingHorizontal="$4"
        paddingVertical="$3"
        alignItems="center"
        justifyContent="space-between"
        minHeight={56}
      >
        <YStack gap="$1">
          <Text
            color={connecting ? '#0A1816' : '$color'}
            fontSize={14}
            fontWeight="600"
          >
            {boot.advertisedName ?? 'Smart Boot'}
          </Text>
          <Text
            color={connecting ? '#0A1816' : '$colorMuted'}
            fontSize={12}
          >
            {boot.deviceId.slice(0, 12)}{boot.deviceId.length > 12 ? '…' : ''}
            {boot.rssi !== null ? ` · ${boot.rssi} dBm` : ''}
          </Text>
        </YStack>
        {connecting && <ActivityIndicator color="#0A1816" />}
      </XStack>
    </Pressable>
  );
}

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled: boolean;
  loading: boolean;
};

function PrimaryButton({ label, onPress, disabled, loading }: PrimaryButtonProps) {
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
