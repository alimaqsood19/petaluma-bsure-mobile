/**
 * Modal.tsx — centered overlay dialog.
 *
 * For bottom-anchored sheets, use BottomSheet.
 *
 * Built on Tamagui's Sheet primitive with a centered presentation.
 */

import React from 'react';
import { Sheet } from 'tamagui';

import { Heading } from './Text';
import { Card } from './Card';

export type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  /** When true, tapping the backdrop dismisses the modal. Default: true. */
  dismissible?: boolean;
};

export function Modal({
  open,
  onOpenChange,
  title,
  children,
  dismissible = true,
}: ModalProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      modal
      dismissOnOverlayPress={dismissible}
      dismissOnSnapToBottom={dismissible}
      animation="base"
      snapPoints={[60]}
      position={0}
    >
      <Sheet.Overlay
        backgroundColor="$overlay"
        animation="fast"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Frame
        padding="$4"
        backgroundColor="$backgroundCard"
        borderTopLeftRadius="$xl"
        borderTopRightRadius="$xl"
        gap="$4"
      >
        <Sheet.Handle backgroundColor="$borderColorStrong" />
        {title && (
          <Heading level={3} accessibilityRole="header">
            {title}
          </Heading>
        )}
        {children}
      </Sheet.Frame>
    </Sheet>
  );
}

export type BottomSheetProps = ModalProps & {
  /** Snap points as percentages of screen height. Default: [40, 80]. */
  snapPoints?: number[];
};

/**
 * BottomSheet — variant of Modal anchored to the bottom with snap points.
 * Used for filters, scan-detail tabs, action sheets.
 */
export function BottomSheet({
  open,
  onOpenChange,
  title,
  children,
  dismissible = true,
  snapPoints = [40, 80],
}: BottomSheetProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      modal
      dismissOnOverlayPress={dismissible}
      dismissOnSnapToBottom={dismissible}
      snapPoints={snapPoints}
      animation="base"
    >
      <Sheet.Overlay
        backgroundColor="$overlay"
        animation="fast"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Frame
        padding="$4"
        backgroundColor="$backgroundCard"
        borderTopLeftRadius="$xl"
        borderTopRightRadius="$xl"
        gap="$3"
      >
        <Sheet.Handle backgroundColor="$borderColorStrong" />
        {title && (
          <Heading level={4} accessibilityRole="header">
            {title}
          </Heading>
        )}
        {children}
      </Sheet.Frame>
    </Sheet>
  );
}
