/**
 * BootPicker — adjacency-aware picker used before scan capture.
 *
 * Renders the paired boots, marking the ones currently advertising as
 * "in range" with their RSSI. Selecting a boot calls onPick with both
 * the paired Boot record and the live device id (the scan flow needs
 * the device id to connect; Realm only stores the serial).
 *
 * Auto-pick optimisation (Phase 2 polish): if exactly one paired boot
 * is in range, we could call onPick directly. For Phase 1 we keep the
 * picker visible so testers see the adjacency scan happen — that's
 * the explicit-selection invariant from F5.4.
 */

import { ActivityIndicator, Pressable } from 'react-native';
import { Stack, Text, XStack, YStack } from 'tamagui';

import {
  type BootAdjacencyEntry,
  mergeAdjacency,
  type PairedBootRow,
  useAdjacencyStore,
} from './adjacency';

export type BootPickerProps = {
  paired: PairedBootRow[];
  onPick: (entry: BootAdjacencyEntry) => void;
};

export function BootPicker({ paired, onPick }: BootPickerProps) {
  const scanning = useAdjacencyStore((s) => s.scanning);
  const inRange = useAdjacencyStore((s) => s.inRange);
  const error = useAdjacencyStore((s) => s.error);
  const startScan = useAdjacencyStore((s) => s.startScan);

  const merged = mergeAdjacency(paired, inRange);

  return (
    <YStack gap="$3">
      <XStack alignItems="center" justifyContent="space-between">
        <Text color="$color" fontSize={14} fontWeight="600">
          Pick a boot
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => void startScan()}
          hitSlop={8}
        >
          <Text color="$primary" fontSize={13} fontWeight="600">
            {scanning ? 'Scanning…' : 'Refresh'}
          </Text>
        </Pressable>
      </XStack>

      {scanning && merged.length === 0 && (
        <XStack gap="$2" alignItems="center">
          <ActivityIndicator color="#00DDA8" />
          <Text color="$colorSecondary" fontSize={13}>
            Listening for paired boots…
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

      {merged.length === 0 && !scanning && (
        <Text color="$colorMuted" fontSize={13}>
          No paired boots yet. Pair one from Boots → Pair a new boot.
        </Text>
      )}

      {merged.map((entry) => (
        <BootRow
          key={entry.paired.id}
          entry={entry}
          onPress={() => onPick(entry)}
        />
      ))}
    </YStack>
  );
}

function BootRow({
  entry,
  onPress,
}: {
  entry: BootAdjacencyEntry;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={
        entry.inRange ? 'In range' : 'Out of range — paired but not advertising'
      }
      onPress={onPress}
      hitSlop={8}
      style={{ opacity: entry.inRange ? 1 : 0.55 }}
    >
      <XStack
        backgroundColor="$backgroundCard"
        borderColor={entry.inRange ? '$primary' : '$borderColor'}
        borderWidth={1}
        borderRadius="$lg"
        paddingHorizontal="$4"
        paddingVertical="$3"
        alignItems="center"
        justifyContent="space-between"
        minHeight={56}
      >
        <YStack gap="$1" flexShrink={1}>
          <Text color="$color" fontSize={14} fontWeight="600">
            {entry.paired.name ?? `Smart Boot ${entry.paired.serial.slice(-4)}`}
          </Text>
          <Text color="$colorMuted" fontSize={12}>
            Serial {entry.paired.serial}
            {typeof entry.paired.lastBatteryPct === 'number'
              ? ` · ${entry.paired.lastBatteryPct}%`
              : ''}
          </Text>
        </YStack>
        <YStack alignItems="flex-end" gap="$1">
          <Text
            color={entry.inRange ? '$primary' : '$colorMuted'}
            fontSize={11}
            fontWeight="700"
            letterSpacing={1}
          >
            {entry.inRange ? 'IN RANGE' : 'NOT FOUND'}
          </Text>
          {entry.rssi !== null && (
            <Text color="$colorMuted" fontSize={11}>
              {entry.rssi} dBm
            </Text>
          )}
        </YStack>
      </XStack>
    </Pressable>
  );
}
