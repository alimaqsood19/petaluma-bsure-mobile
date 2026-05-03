import type { Meta, StoryObj } from '@storybook/react';
import { XStack } from 'tamagui';

import { Pill } from './Pill';

const meta: Meta<typeof Pill> = {
  title: 'Foundations/Pill',
  component: Pill,
  args: { children: 'Normal' },
};

export default meta;
type Story = StoryObj<typeof Pill>;

export const Normal: Story = { args: { intent: 'normal', children: 'Normal' } };
export const Med: Story = { args: { intent: 'med', children: 'Med' } };
export const High: Story = { args: { intent: 'high', children: 'High' } };
export const Brand: Story = { args: { intent: 'brand', children: 'Connected Boots' } };
export const Neutral: Story = { args: { intent: 'neutral', children: 'Untagged' } };

export const TemperaturePalette: Story = {
  render: () => (
    <XStack gap="$2" flexWrap="wrap">
      <Pill intent="normal">Normal</Pill>
      <Pill intent="med">Med</Pill>
      <Pill intent="high">High</Pill>
    </XStack>
  ),
};

export const HotHorseAlert: Story = {
  render: () => (
    <XStack gap="$2">
      <Pill intent="high">2 Heat alerts</Pill>
      <Pill intent="normal">6 Normal</Pill>
    </XStack>
  ),
};
