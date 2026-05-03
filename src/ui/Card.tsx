/**
 * Card.tsx — container surface for grouped content.
 *
 * Variants:
 *   variant: filled (default) | outlined | flat
 *   padding: none | sm | md (default) | lg
 *
 * Used for horse cards, scan summary cards, settings rows, etc.
 */

import React from 'react';
import { GetProps, styled, YStack } from 'tamagui';

const StyledCard = styled(YStack, {
  name: 'BsureCard',
  backgroundColor: '$backgroundCard',
  borderRadius: '$lg',
  overflow: 'hidden',

  variants: {
    variant: {
      filled: {
        backgroundColor: '$backgroundCard',
        shadowColor: '$shadowMd' as any,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '$borderColor',
      },
      flat: {
        backgroundColor: '$backgroundAlt',
      },
    },
    padding: {
      none: { padding: 0 },
      sm: { padding: '$3' },
      md: { padding: '$4' },
      lg: { padding: '$6' },
    },
    pressable: {
      true: {
        pressStyle: { opacity: 0.85, scale: 0.99 },
        animation: 'fast',
        // @ts-expect-error — accessibilityRole is valid; Tamagui types don't include it on YStack
        accessibilityRole: 'button',
      },
    },
  } as const,

  defaultVariants: {
    variant: 'filled',
    padding: 'md',
  },
});

export type CardProps = GetProps<typeof StyledCard>;

export const Card = StyledCard;
