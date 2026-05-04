import { View } from 'react-native';

type TabIconName = 'home' | 'quickRead' | 'alerts' | 'account';

type TabIconProps = {
  name: TabIconName;
  color: string;
  focused: boolean;
};

const SHAPE: Record<TabIconName, { borderRadius: number; rotate?: string }> = {
  home: { borderRadius: 4 },
  quickRead: { borderRadius: 12 },
  alerts: { borderRadius: 4, rotate: '45deg' },
  account: { borderRadius: 12 },
};

export function TabIcon({ name, color, focused }: TabIconProps) {
  const shape = SHAPE[name];
  return (
    <View
      style={{
        width: focused ? 22 : 18,
        height: focused ? 22 : 18,
        borderWidth: 2,
        borderColor: color,
        backgroundColor: focused ? color : 'transparent',
        borderRadius: shape.borderRadius,
        transform: shape.rotate ? [{ rotate: shape.rotate }] : undefined,
      }}
    />
  );
}
