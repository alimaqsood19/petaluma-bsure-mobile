import type { Meta, StoryObj } from '@storybook/react';
import { XStack, YStack } from 'tamagui';

import { Card } from './Card';
import { Body, Caption, Heading } from './Text';
import { Pill } from './Pill';
import { Button } from './Button';

const meta: Meta<typeof Card> = {
  title: 'Foundations/Card',
  component: Card,
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Filled: Story = {
  render: () => (
    <Card width={280}>
      <Heading level={4}>Buttercup</Heading>
      <Caption>Discipline: Jumping</Caption>
    </Card>
  ),
};

export const Outlined: Story = {
  render: () => (
    <Card variant="outlined" width={280}>
      <Heading level={4}>Buttercup</Heading>
      <Caption>Discipline: Jumping</Caption>
    </Card>
  ),
};

export const HorseCard: Story = {
  render: () => (
    <Card width={300} padding="none">
      <YStack
        height={140}
        backgroundColor="$neutral800"
        alignItems="center"
        justifyContent="center"
      >
        <Body intent="muted">[ horse photo ]</Body>
      </YStack>
      <YStack padding="$4" gap="$2">
        <Heading level={4}>Buttercup</Heading>
        <Caption>Discipline · Jumping</Caption>
        <XStack alignItems="center" gap="$2" marginTop="$2">
          <Pill intent="high" size="sm">Lost Reading</Pill>
          <Caption>May 11, 2024</Caption>
        </XStack>
        <XStack gap="$2" marginTop="$3">
          <Button variant="secondary" size="sm" flex={1}>View Profile</Button>
          <Button size="sm" flex={1}>Start Reading</Button>
        </XStack>
      </YStack>
    </Card>
  ),
};
