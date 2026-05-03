/**
 * Toggle.tsx — accessible switch with optional label.
 *
 * Used for "Hot Readings" filter, notification preferences, etc.
 */

import React from 'react';
import { Pressable } from 'react-native';
import { Text, XStack, YStack, styled } from 'tamagui';

const Track = styled(XStack, {
  name: 'BsureToggleTrack',
  width: 44,
  height: 24,
  borderRadius: '$pill',
  backgroundColor: '$borderColorStrong',
  padding: 2,
  animation: 'fast',

  variants: {
    on: {
      true: { backgroundColor: '$primary' },
    },
    disabled: {
      true: { opacity: 0.4 },
    },
  } as const,
});

const Thumb = styled(YStack, {
  name: 'BsureToggleThumb',
  width: 20,
  height: 20,
  borderRadius: '$round',
  backgroundColor: '$neutral0',
  shadowColor: 'rgba(0,0,0,0.2)',
  shadowRadius: 2,
  shadowOffset: { width: 0, height: 1 },
  animation: 'fast',

  variants: {
    on: {
      true: { transform: [{ translateX: 20 }] },
    },
  } as const,
});

export type ToggleProps = {
  value: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  disabled?: boolean;
  /** Position the label to the left or right of the toggle. Default: right. */
  labelPosition?: 'left' | 'right';
};

export function Toggle({
  value,
  onChange,
  label,
  disabled = false,
  labelPosition = 'right',
}: ToggleProps) {
  const handlePress = () => {
    if (!disabled) onChange(!value);
  };

  const switchEl = (
    <Track on={value} disabled={disabled}>
      <Thumb on={value} />
    </Track>
  );

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={label}
      onPress={handlePress}
      hitSlop={8}
    >
      <XStack alignItems="center" gap="$3">
        {label && labelPosition === 'left' && (
          <Text fontSize="$base" color="$color">
            {label}
          </Text>
        )}
        {switchEl}
        {label && labelPosition === 'right' && (
          <Text fontSize="$base" color="$color">
            {label}
          </Text>
        )}
      </XStack>
    </Pressable>
  );
}
