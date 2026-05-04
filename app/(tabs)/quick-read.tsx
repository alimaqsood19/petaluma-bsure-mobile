import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView } from 'react-native';
import { Stack, Text, YStack } from 'tamagui';

import { BluetoothRequired } from '@/ble/BluetoothRequired';
import { useBleStore } from '@/ble/store';

export default function QuickReadScreen() {
  const status = useBleStore((s) => s.status);
  const refresh = useBleStore((s) => s.refresh);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

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
            Scan without picking a horse
          </Text>
          <Text color="$colorSecondary" fontSize={14}>
            Capture a reading first; assign it to a horse later.
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
          <Text color="$color" fontSize={14} fontWeight="600">
            Coming in T1.24
          </Text>
          <Text color="$colorSecondary" fontSize={13}>
            Wires the BLE state machine (T1.20) + scan capture flow (T1.23)
            into the unassigned-scan path.
          </Text>
        </Stack>
      </YStack>
    </ScrollView>
  );
}
