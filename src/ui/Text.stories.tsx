import type { Meta, StoryObj } from '@storybook/react';
import { YStack } from 'tamagui';

import { Body, Caption, Heading, Label } from './Text';

const meta: Meta = {
  title: 'Foundations/Typography',
};

export default meta;
type Story = StoryObj;

export const Headings: Story = {
  render: () => (
    <YStack gap="$3">
      <Heading level={1}>Heading 1 — 56px / Bold</Heading>
      <Heading level={2}>Heading 2 — 40px / Bold</Heading>
      <Heading level={3}>Heading 3 — 32px / Bold</Heading>
      <Heading level={4}>Heading 4 — 24px / Semibold</Heading>
      <Heading level={5}>Heading 5 — 20px / Semibold</Heading>
      <Heading level={6}>Heading 6 — 18px / Semibold</Heading>
    </YStack>
  ),
};

export const BodySizes: Story = {
  render: () => (
    <YStack gap="$3" width={420}>
      <Body size="lg">Body Large — Use sparingly for callouts and intros that need extra breathing room.</Body>
      <Body size="md">Body Medium — A slightly larger body for emphasis on key paragraphs.</Body>
      <Body size="base">Body Base — The default. Use for most paragraph content.</Body>
      <Body size="sm">Body Small — Secondary descriptions or supporting details.</Body>
    </YStack>
  ),
};

export const SemanticTones: Story = {
  render: () => (
    <YStack gap="$2">
      <Body intent="primary">Primary text — most readable, highest contrast.</Body>
      <Body intent="secondary">Secondary — supporting / metadata.</Body>
      <Body intent="muted">Muted — least emphasized.</Body>
      <Body intent="brand" weight="semibold">Brand — accents, links, CTA-text-style.</Body>
      <Body intent="danger">Danger — error messages, destructive cues.</Body>
    </YStack>
  ),
};

export const LabelAndCaption: Story = {
  render: () => (
    <YStack gap="$3">
      <Label>FIELD LABEL</Label>
      <Body>Some content here</Body>
      <Caption>Auxiliary metadata — May 11, 2024 · 184 sensors captured</Caption>
    </YStack>
  ),
};
