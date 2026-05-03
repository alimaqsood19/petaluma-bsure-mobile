/**
 * Text.tsx — typography primitives.
 *
 * Re-exports Tamagui's Text + H1..H6 + Paragraph with B-Sure semantic styling.
 *
 * Use the named exports (Heading, Body, Label, Caption) for semantic clarity.
 */

import { GetProps, styled, Text as TText } from 'tamagui';

export const Heading = styled(TText, {
  name: 'BsureHeading',
  fontFamily: '$heading',
  color: '$color',
  letterSpacing: -0.2,

  variants: {
    level: {
      1: { fontSize: '$4xl', fontWeight: '700', lineHeight: '$tight' as any },
      2: { fontSize: '$3xl', fontWeight: '700', lineHeight: '$tight' as any },
      3: { fontSize: '$2xl', fontWeight: '700', lineHeight: '$snug' as any },
      4: { fontSize: '$xl', fontWeight: '600', lineHeight: '$snug' as any },
      5: { fontSize: '$lg', fontWeight: '600', lineHeight: '$snug' as any },
      6: { fontSize: '$md', fontWeight: '600', lineHeight: '$snug' as any },
    },
  } as const,

  defaultVariants: { level: 2 },
});

export const Body = styled(TText, {
  name: 'BsureBody',
  fontFamily: '$body',
  fontSize: '$base',
  color: '$color',
  lineHeight: '$normal' as any,

  variants: {
    size: {
      sm: { fontSize: '$sm' },
      base: { fontSize: '$base' },
      md: { fontSize: '$md' },
      lg: { fontSize: '$lg' },
    },
    intent: {
      primary: { color: '$color' },
      secondary: { color: '$colorSecondary' },
      muted: { color: '$colorMuted' },
      brand: { color: '$primary' },
      danger: { color: '$tempHigh' },
    },
    weight: {
      regular: { fontWeight: '400' },
      medium: { fontWeight: '500' },
      semibold: { fontWeight: '600' },
      bold: { fontWeight: '700' },
    },
  } as const,
});

export const Label = styled(TText, {
  name: 'BsureLabel',
  fontFamily: '$body',
  fontSize: '$sm',
  fontWeight: '500',
  color: '$colorSecondary',
  letterSpacing: 0.2,
});

export const Caption = styled(TText, {
  name: 'BsureCaption',
  fontFamily: '$body',
  fontSize: '$xs',
  color: '$colorMuted',
  letterSpacing: 0.4,
});

export type HeadingProps = GetProps<typeof Heading>;
export type BodyProps = GetProps<typeof Body>;
export type LabelProps = GetProps<typeof Label>;
export type CaptionProps = GetProps<typeof Caption>;
