import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Text, YStack } from 'tamagui';

import { BottomNav } from './BottomNav';

const meta: Meta<typeof BottomNav> = {
  title: 'Foundations/BottomNav',
  component: BottomNav,
};

export default meta;
type Story = StoryObj<typeof BottomNav>;

const homeIcon = <Text fontSize={20}>⌂</Text>;
const quickIcon = <Text fontSize={20}>⏱</Text>;
const alertsIcon = <Text fontSize={20}>🔔</Text>;
const accountIcon = <Text fontSize={20}>👤</Text>;

export const Default: Story = {
  render: () => {
    const [active, setActive] = useState('home');
    return (
      <YStack width={420} backgroundColor="$background" minHeight={120} justifyContent="flex-end">
        <BottomNav
          tabs={[
            { key: 'home', label: 'Home', icon: homeIcon },
            { key: 'quick', label: 'Quick Read', icon: quickIcon },
            { key: 'alerts', label: 'Alerts', icon: alertsIcon, badge: 2 },
            { key: 'account', label: 'Account', icon: accountIcon },
          ]}
          active={active}
          onChange={setActive}
        />
      </YStack>
    );
  },
};

export const WithLargeBadge: Story = {
  render: () => {
    const [active, setActive] = useState('alerts');
    return (
      <YStack width={420} backgroundColor="$background" minHeight={120} justifyContent="flex-end">
        <BottomNav
          tabs={[
            { key: 'home', label: 'Home', icon: homeIcon },
            { key: 'quick', label: 'Quick Read', icon: quickIcon },
            { key: 'alerts', label: 'Alerts', icon: alertsIcon, badge: 142 },
            { key: 'account', label: 'Account', icon: accountIcon },
          ]}
          active={active}
          onChange={setActive}
        />
      </YStack>
    );
  },
};
