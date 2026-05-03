/**
 * bsure-ui — design-system barrel export.
 *
 * Components consume `tokens.json` via `tamagui.config.ts`. To change a token
 * value, edit `tokens.json` and rebuild — never hard-code values in components.
 *
 * Refs: ADR 0017 (design system in Phase 1), ADR 0022 (Tamagui).
 */

export { ThemeProvider, useThemePreference } from './ThemeProvider';

export { Button } from './Button';
export type { ButtonProps } from './Button';

export { Pill } from './Pill';
export type { PillProps } from './Pill';

export { Input } from './Input';
export type { InputProps } from './Input';

export { Card } from './Card';
export type { CardProps } from './Card';

export { Heading, Body, Label, Caption } from './Text';
export type { HeadingProps, BodyProps, LabelProps, CaptionProps } from './Text';

export { Modal, BottomSheet } from './Modal';
export type { ModalProps, BottomSheetProps } from './Modal';

export { Tabs } from './Tab';
export type { TabsProps, TabItemDef } from './Tab';

export { Header } from './Header';
export type { HeaderProps } from './Header';

export { BottomNav } from './BottomNav';
export type { BottomNavProps, BottomNavTab } from './BottomNav';

export { Toggle } from './Toggle';
export type { ToggleProps } from './Toggle';
