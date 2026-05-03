/**
 * Pill.tsx — small status indicator.
 *
 * Used for: temperature labels (normal/med/high), Hot Horses count, "Connected
 * Boots" status, alert acknowledgement state.
 *
 * Variants tied to the temperature semantic palette so a Pill is *the* visual
 * primitive for any "status with color" usage. Pills never carry meaning by
 * color alone — content (text/icon) must convey it (constitution N5.3).
 */

import React from 'react';
import { GetProps, styled, Text, XStack } from 'tamagui';

const PillContainer = styled(XStack, {
  name: 'BsurePill',
  borderRadius: '$pill',
  paddingHorizontal: '$3',
  paddingVertical: '$1',
  alignItems: 'center',
  gap: '$1',
  alignSelf: 'flex-start',

  variants: {
    intent: {
      neutral: {
        backgroundColor: '$neutral200',
      },
      normal: {
        backgroundColor: '$tempNormal',
      },
      med: {
        backgroundColor: '$tempMed',
      },
      high: {
        backgroundColor: '$tempHigh',
      },
      brand: {
        backgroundColor: '$primary',
      },
      info: {
        backgroundColor: '$info' as any,
      },
    },
    size: {
      sm: { paddingHorizontal: '$2', paddingVertical: 2 },
      md: { paddingHorizontal: '$3', paddingVertical: '$1' },
    },
    outline: {
      true: {
        backgroundColor: 'transparent',
        borderWidth: 1,
      },
    },
  } as const,

  defaultVariants: {
    intent: 'neutral',
    size: 'md',
  },
});

type PillContainerProps = GetProps<typeof PillContainer>;

export type PillProps = PillContainerProps & {
  children: React.ReactNode;
  leadingIcon?: React.ReactNode;
};

const textColorByIntent: Record<NonNullable<PillContainerProps['intent']>, string> = {
  neutral: '$color',
  normal: '$neutral0',
  med: '$neutral900',
  high: '$neutral0',
  brand: '$colorOnPrimary',
  info: '$neutral0',
};

export function Pill({
  children,
  intent = 'neutral',
  size = 'md',
  outline,
  leadingIcon,
  ...rest
}: PillProps) {
  return (
    <PillContainer intent={intent} size={size} outline={outline} {...rest}>
      {leadingIcon}
      <Text
        color={textColorByIntent[intent]}
        fontSize={size === 'sm' ? '$xs' : '$sm'}
        fontWeight="600"
        letterSpacing={0.4}
      >
        {children}
      </Text>
    </PillContainer>
  );
}
