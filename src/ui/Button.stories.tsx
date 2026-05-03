import type { Meta, StoryObj } from '@storybook/react';
import { XStack, YStack } from 'tamagui';

import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Foundations/Button',
  component: Button,
  args: { children: 'Start Reading' },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {};

export const Secondary: Story = { args: { variant: 'secondary' } };

export const Ghost: Story = { args: { variant: 'ghost', children: 'Skip' } };

export const Danger: Story = { args: { variant: 'danger', children: 'Delete account' } };

export const Loading: Story = { args: { loading: true } };

export const Disabled: Story = { args: { disabled: true } };

export const AllSizes: Story = {
  render: () => (
    <YStack gap="$3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium (default)</Button>
      <Button size="lg">Large</Button>
    </YStack>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <XStack gap="$3" flexWrap="wrap">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </XStack>
  ),
};
