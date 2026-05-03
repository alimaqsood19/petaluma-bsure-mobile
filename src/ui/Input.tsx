/**
 * Input.tsx — text input with optional label, helper, error state, leading icon.
 *
 * States: default, focus, disabled, error
 * Sizes:  sm | md (default) | lg
 *
 * Designed to match the wireframe sign-up + horse-profile forms.
 */

import React, { useState } from 'react';
import {
  GetProps,
  Input as TInput,
  Label,
  styled,
  Text,
  YStack,
} from 'tamagui';

const StyledInput = styled(TInput, {
  name: 'BsureInput',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$md',
  backgroundColor: '$backgroundAlt',
  color: '$color',
  fontSize: '$base',
  paddingHorizontal: '$4',
  height: 48, // ≥ 44 hit-target

  focusStyle: {
    borderColor: '$primary',
    outlineWidth: 0,
  },

  variants: {
    size: {
      sm: { height: 40, fontSize: '$sm', paddingHorizontal: '$3' },
      md: { height: 48 },
      lg: { height: 56, fontSize: '$md', paddingHorizontal: '$5' },
    },
    error: {
      true: { borderColor: '$tempHigh' },
    },
    disabled: {
      true: { opacity: 0.5, pointerEvents: 'none' },
    },
  } as const,

  defaultVariants: {
    size: 'md',
  },
});

type StyledInputProps = GetProps<typeof StyledInput>;

export type InputProps = StyledInputProps & {
  /** Label rendered above the input. */
  label?: string;
  /** Helper text (gray) under the input — shown when no error. */
  helperText?: string;
  /** Error message (red) under the input — overrides helperText when present. */
  error?: string;
  /** Marks the field required (adds an asterisk to the label). */
  required?: boolean;
};

export function Input({
  label,
  helperText,
  error,
  required,
  size = 'md',
  disabled,
  ...rest
}: InputProps) {
  const inputId = React.useId();
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);

  return (
    <YStack gap="$1" width="100%">
      {label && (
        <Label htmlFor={inputId} fontSize="$sm" color="$colorSecondary" fontWeight="500">
          {label}
          {required && (
            <Text color="$tempHigh" marginLeft="$0.5">
              *
            </Text>
          )}
        </Label>
      )}
      <StyledInput
        id={inputId}
        size={size}
        error={hasError}
        disabled={disabled}
        onFocus={(e: any) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e: any) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        accessibilityState={{ disabled: !!disabled }}
        accessibilityLabel={label}
        accessibilityHint={hasError ? error : helperText}
        {...rest}
      />
      {(helperText || error) && (
        <Text fontSize="$xs" color={hasError ? '$tempHigh' : '$colorMuted'}>
          {error ?? helperText}
        </Text>
      )}
    </YStack>
  );
}
