import { Stack } from 'expo-router';

export default function HorsesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#0A1816' },
        headerTitleStyle: { color: '#FFFFFF' },
        headerTintColor: '#00DDA8',
        contentStyle: { backgroundColor: '#0A1816' },
      }}
    >
      <Stack.Screen name="new" options={{ title: 'New horse' }} />
      <Stack.Screen name="[id]/index" options={{ title: 'Horse' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit horse' }} />
    </Stack>
  );
}
