import { ScrollView } from 'react-native';
import { Stack, Text, YStack } from 'tamagui';

export default function CompleteProfileScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0A1816' }}>
      <YStack padding="$5" gap="$5">
        <YStack gap="$2">
          <Text color="$colorMuted" fontSize={12} letterSpacing={2}>
            COMPLETE PROFILE
          </Text>
          <Text color="$color" fontSize={28} fontWeight="700">
            Tell us about you
          </Text>
          <Text color="$colorSecondary" fontSize={14}>
            Name, role, stable, discipline. Real form lands in T1.17.
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
            Coming in T1.17
          </Text>
          <Text color="$colorSecondary" fontSize={13}>
            PATCH /v1/me with name, role, stable name, discipline. Auto-creates
            a personal Organization on the backend if the user doesn't have
            one yet.
          </Text>
        </Stack>
      </YStack>
    </ScrollView>
  );
}
