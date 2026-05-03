/**
 * BottomNav.tsx — four-tab bottom navigation.
 *
 * Wireframes: Home · Quick Read · Alerts · Account.
 *
 * NOTE: this is the visual primitive. Wiring to Expo Router happens in
 * `app/(tabs)/_layout.tsx` (T1.15).
 */

import React from 'react';
import { Pressable } from 'react-native';
import { Text, XStack, YStack, styled } from 'tamagui';

const NavRoot = styled(XStack, {
  name: 'BsureBottomNav',
  flexDirection: 'row',
  borderTopWidth: 1,
  borderTopColor: '$borderColor',
  backgroundColor: '$background',
  paddingHorizontal: '$2',
  paddingTop: '$2',
  paddingBottom: '$4', // account for iPhone home indicator
  width: '100%',
});

const NavItemContainer = styled(YStack, {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: '$2',
  minHeight: 44,
  pressStyle: { opacity: 0.7 },
});

export type BottomNavTab = {
  key: string;
  label: string;
  icon: React.ReactNode;
  /** When the tab has a count badge (e.g., Alerts) — render as number, omit for none. */
  badge?: number;
};

export type BottomNavProps = {
  tabs: BottomNavTab[];
  active: string;
  onChange: (key: string) => void;
};

export function BottomNav({ tabs, active, onChange }: BottomNavProps) {
  return (
    <NavRoot accessibilityRole="tablist">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(tab.key)}
            style={{ flex: 1 }}
          >
            <NavItemContainer>
              <YStack position="relative">
                {tab.icon}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <YStack
                    position="absolute"
                    top={-4}
                    right={-8}
                    minWidth={16}
                    height={16}
                    paddingHorizontal={4}
                    borderRadius={9999}
                    backgroundColor="$tempHigh"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize={10} fontWeight="700" color="$neutral0">
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </Text>
                  </YStack>
                )}
              </YStack>
              <Text
                fontSize="$xs"
                fontWeight={isActive ? '600' : '500'}
                color={isActive ? '$primary' : '$colorMuted'}
                marginTop="$1"
              >
                {tab.label}
              </Text>
            </NavItemContainer>
          </Pressable>
        );
      })}
    </NavRoot>
  );
}
