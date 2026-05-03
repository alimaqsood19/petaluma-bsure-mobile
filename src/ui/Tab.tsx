/**
 * Tab.tsx — horizontal underline tab bar.
 *
 * Used on horse profile (Activity / Basic Info / Manage Data) and scan detail
 * (Model / Heat map / Notes) per wireframes.
 */

import React from 'react';
import { Text, XStack, YStack, styled } from 'tamagui';

const TabRoot = styled(XStack, {
  name: 'BsureTabBar',
  flexDirection: 'row',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
  width: '100%',
});

const TabItem = styled(YStack, {
  name: 'BsureTabItem',
  flex: 1,
  paddingVertical: '$3',
  alignItems: 'center',
  borderBottomWidth: 2,
  borderBottomColor: 'transparent',
  marginBottom: -1, // overlap the bar's 1px border
  pressStyle: { opacity: 0.7 },
  animation: 'fast',

  variants: {
    active: {
      true: { borderBottomColor: '$primary' },
    },
  } as const,
});

export type TabItemDef = {
  /** Stable key, used in `value`/`onChange`. */
  key: string;
  label: string;
};

export type TabsProps = {
  items: TabItemDef[];
  value: string;
  onChange: (key: string) => void;
};

export function Tabs({ items, value, onChange }: TabsProps) {
  return (
    <TabRoot accessibilityRole="tablist">
      {items.map((item) => {
        const active = item.key === value;
        return (
          <TabItem
            key={item.key}
            active={active}
            onPress={() => onChange(item.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text
              fontSize="$sm"
              fontWeight={active ? '600' : '500'}
              color={active ? '$color' : '$colorMuted'}
            >
              {item.label}
            </Text>
          </TabItem>
        );
      })}
    </TabRoot>
  );
}
