import { Tabs } from 'expo-router';
import { useTheme } from 'tamagui';

import { TabIcon } from '@/ui/nav/TabIcon';

export default function TabsLayout() {
  const theme = useTheme();
  const activeColor = theme.primary?.val ?? '#00DDA8';
  const inactiveColor = theme.colorMuted?.val ?? '#8A9893';
  const background = theme.background?.val ?? '#0A1816';
  const border = theme.borderColor?.val ?? '#2A3633';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: background,
          borderTopColor: border,
          borderTopWidth: 1,
          height: 84,
          paddingTop: 8,
          paddingBottom: 24,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="quick-read"
        options={{
          title: 'Quick Read',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="quickRead" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="alerts" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="account" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
