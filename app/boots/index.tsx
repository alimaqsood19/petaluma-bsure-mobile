import { Link } from 'expo-router';
import { Pressable, ScrollView } from 'react-native';
import { Stack, Text, XStack, YStack } from 'tamagui';

export default function BootsListScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0A1816' }}>
      <YStack padding="$5" gap="$5">
        <YStack gap="$2">
          <Text color="$colorMuted" fontSize={12} letterSpacing={2}>
            BOOTS
          </Text>
          <Text color="$color" fontSize={28} fontWeight="700">
            Paired boots
          </Text>
          <Text color="$colorSecondary" fontSize={14}>
            Live list lands with T1.21 (multi-boot picker reads from Realm).
          </Text>
        </YStack>

        <Link href="/boots/pair" asChild>
          <Pressable accessibilityRole="button" hitSlop={8}>
            <XStack
              backgroundColor="$primary"
              borderRadius="$pill"
              paddingHorizontal="$5"
              paddingVertical="$4"
              alignItems="center"
              justifyContent="center"
              minHeight={52}
            >
              <Text color="#0A1816" fontSize={15} fontWeight="700">
                Pair a new boot
              </Text>
            </XStack>
          </Pressable>
        </Link>

        <Stack
          backgroundColor="$backgroundCard"
          borderRadius="$lg"
          borderWidth={1}
          borderColor="$borderColor"
          padding="$4"
          gap="$2"
        >
          <Text color="$colorMuted" fontSize={11} letterSpacing={1.5}>
            HARDWARE CONTRACT
          </Text>
          <Text color="$colorSecondary" fontSize={13} lineHeight={18}>
            Smart Boots speak the TempPulse BLE service per ADR 0009. Pair via
            Bluetooth, name on this device — firmware doesn't store names.
          </Text>
        </Stack>
      </YStack>
    </ScrollView>
  );
}
