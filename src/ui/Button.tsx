/**
 * Button.tsx — primary tap target.
 *
 * Variants:
 *   variant: primary (mint pill, default), secondary (outline), ghost (text-only), danger (red)
 *   size:    sm | md (default) | lg
 *   state:   default | loading | disabled
 *
 * Wireframes show pill-radius primary CTAs throughout — `radius="pill"` is the
 * default. Hit target ≥ 44×44 (constitution N5.4) enforced by min height.
 */

import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Button as TButton, GetProps, styled, Text } from 'tamagui';

const StyledButton = styled(TButton, {
  name: 'BsureButton',
  pressStyle: { opacity: 0.85 },
  borderRadius: '$pill',
  paddingHorizontal: '$5',
  height: 48, // ≥ 44 hit-target rule (N5.4)
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  animation: 'fast',

  variants: {
    variant: {
      primary: {
        backgroundColor: '$primary',
        color: '$colorOnPrimary',
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '$borderColorStrong',
        color: '$color',
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        color: '$primary',
      },
      danger: {
        backgroundColor: '$tempHigh',
        color: '$neutral0',
        borderWidth: 0,
      },
    },
    size: {
      sm: { height: 40, paddingHorizontal: '$4' },
      md: { height: 48, paddingHorizontal: '$5' },
      lg: { height: 56, paddingHorizontal: '$6' },
    },
    fullWidth: {
      true: { alignSelf: 'stretch' },
    },
    disabled: {
      true: { opacity: 0.4, pointerEvents: 'none' },
    },
  } as const,

  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

type StyledButtonProps = GetProps<typeof StyledButton>;

export type ButtonProps = StyledButtonProps & {
  children: React.ReactNode;
  loading?: boolean;
  /** Optional icon rendered before the label. */
  leadingIcon?: React.ReactNode;
  /** Optional icon rendered after the label. */
  trailingIcon?: React.ReactNode;
};

const labelColorByVariant: Record<NonNullable<StyledButtonProps['variant']>, string> = {
  primary: '$colorOnPrimary',
  secondary: '$color',
  ghost: '$primary',
  danger: '$neutral0',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leadingIcon,
  trailingIcon,
  ...rest
}: ButtonProps) {
  const labelColor = labelColorByVariant[variant];
  const labelSize = size === 'sm' ? '$sm' : size === 'lg' ? '$md' : '$base';

  return (
    <StyledButton
      variant={variant}
      size={size}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={labelColor === '$colorOnPrimary' ? '#0A1816' : undefined} />
      ) : (
        <>
          {leadingIcon}
          <Text
            color={labelColor}
            fontSize={labelSize}
            fontWeight="600"
            paddingHorizontal={leadingIcon || trailingIcon ? '$2' : 0}
          >
            {children}
          </Text>
          {trailingIcon}
        </>
      )}
    </StyledButton>
  );
}
