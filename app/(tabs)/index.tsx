import Constants from 'expo-constants';
import { ScrollView } from 'react-native';
import { Stack, Text, YStack } from 'tamagui';

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function HomeScreen() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0A1816' }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <YStack padding="$5" gap="$5">
        <YStack gap="$2">
          <Text color="$colorMuted" fontSize={12} letterSpacing={2}>
            B·SURE
          </Text>
          <Text color="$color" fontSize={28} fontWeight="700">
            Home
          </Text>
          <Text color="$colorSecondary" fontSize={14}>
            Your barn at a glance.
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
            HOT HORSES
          </Text>
          <Text color="$color" fontSize={36} fontWeight="700">
            0
          </Text>
          <Text color="$colorSecondary" fontSize={13}>
            No active alerts. Real horse list lands in T1.22.
          </Text>
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
            ENVIRONMENT
          </Text>
          <Text color="$color" fontSize={14}>
            API: {apiUrl}
          </Text>
          <Text color="$colorMuted" fontSize={12}>
            Build: {Constants.expoConfig?.version ?? 'dev'}
          </Text>
        </Stack>
      </YStack>
    </ScrollView>
  );
}
