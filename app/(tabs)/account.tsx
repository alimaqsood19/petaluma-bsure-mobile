import { ScrollView } from 'react-native';
import { Stack, Text, YStack } from 'tamagui';

export default function AccountScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0A1816' }}>
      <YStack padding="$5" gap="$5">
        <YStack gap="$2">
          <Text color="$colorMuted" fontSize={12} letterSpacing={2}>
            ACCOUNT
          </Text>
          <Text color="$color" fontSize={28} fontWeight="700">
            You
          </Text>
          <Text color="$colorSecondary" fontSize={14}>
            Profile, theme, units, sign out, delete account.
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
            Coming in T1.26
          </Text>
          <Text color="$colorSecondary" fontSize={13}>
            Theme picker, units picker, sign out, account delete with 60-day grace.
          </Text>
        </Stack>
      </YStack>
    </ScrollView>
  );
}
