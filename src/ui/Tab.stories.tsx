import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { YStack, Text } from 'tamagui';

import { Tabs } from './Tab';

const meta: Meta<typeof Tabs> = {
  title: 'Foundations/Tabs',
  component: Tabs,
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const HorseProfile: Story = {
  render: () => {
    const [active, setActive] = useState('activity');
    return (
      <YStack width={360}>
        <Tabs
          items={[
            { key: 'activity', label: 'Activity' },
            { key: 'basic', label: 'Basic Info' },
            { key: 'manage', label: 'Manage Data' },
          ]}
          value={active}
          onChange={setActive}
        />
        <YStack padding="$4">
          <Text color="$colorMuted">Active tab: {active}</Text>
        </YStack>
      </YStack>
    );
  },
};

export const ScanDetail: Story = {
  render: () => {
    const [active, setActive] = useState('model');
    return (
      <YStack width={360}>
        <Tabs
          items={[
            { key: 'model', label: 'Model' },
            { key: 'heatmap', label: 'Heat map' },
            { key: 'notes', label: 'Notes' },
          ]}
          value={active}
          onChange={setActive}
        />
      </YStack>
    );
  },
};
