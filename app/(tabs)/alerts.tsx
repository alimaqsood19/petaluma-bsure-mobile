import { ScrollView } from 'react-native';
import { Stack, Text, YStack } from 'tamagui';

export default function AlertsScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0A1816' }}>
      <YStack padding="$5" gap="$5">
        <YStack gap="$2">
          <Text color="$colorMuted" fontSize={12} letterSpacing={2}>
            ALERTS
          </Text>
          <Text color="$color" fontSize={28} fontWeight="700">
            All clear
          </Text>
          <Text color="$colorSecondary" fontSize={14}>
            Elevated heat or asymmetry on a horse will surface here.
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
            Phase 2 surface (T2.19)
          </Text>
          <Text color="$colorSecondary" fontSize={13}>
            Backend baselines + alert rules engine landed in T2.01–T2.03; the
            mobile feed + acknowledge UX wires up in Phase 2.
          </Text>
        </Stack>
      </YStack>
    </ScrollView>
  );
}
