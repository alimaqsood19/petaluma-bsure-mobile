import { Stack } from 'expo-router';

export default function BootsLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Smart Boots' }} />
      <Stack.Screen name="pair" options={{ title: 'Pair a Smart Boot' }} />
    </Stack>
  );
}
