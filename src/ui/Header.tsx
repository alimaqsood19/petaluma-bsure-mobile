/**
 * Header.tsx — app screen header with back button + title + right-side actions.
 *
 * Wireframes show: chevron-back left, title or "Home"/"Profile", right-side
 * "Connected Boots" pill with BT status icon.
 */

import React from 'react';
import { Pressable } from 'react-native';
import { GetProps, styled, Text, XStack } from 'tamagui';

const HeaderRoot = styled(XStack, {
  name: 'BsureHeader',
  alignItems: 'center',
  paddingHorizontal: '$4',
  paddingVertical: '$3',
  height: 56,
  backgroundColor: '$background',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
  gap: '$3',
});

export type HeaderProps = GetProps<typeof HeaderRoot> & {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  /** Replace the title with a custom node (e.g., logo). */
  centerSlot?: React.ReactNode;
};

export function Header({
  title,
  showBack,
  onBack,
  rightAction,
  centerSlot,
  ...rest
}: HeaderProps) {
  return (
    <HeaderRoot {...rest}>
      {showBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          hitSlop={8}
          style={{ minWidth: 44, minHeight: 44, justifyContent: 'center' }}
        >
          <Text fontSize="$xl" color="$color" fontWeight="500">
            ‹
          </Text>
        </Pressable>
      ) : (
        <XStack width={44} />
      )}

      <XStack flex={1} justifyContent="center">
        {centerSlot ?? (
          <Text fontSize="$md" fontWeight="600" color="$color" numberOfLines={1}>
            {title ?? ''}
          </Text>
        )}
      </XStack>

      <XStack minWidth={44} justifyContent="flex-end">
        {rightAction}
      </XStack>
    </HeaderRoot>
  );
}
