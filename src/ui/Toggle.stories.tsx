import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { YStack } from 'tamagui';

import { Toggle } from './Toggle';

const meta: Meta<typeof Toggle> = {
  title: 'Foundations/Toggle',
  component: Toggle,
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  render: () => {
    const [v, setV] = useState(false);
    return <Toggle value={v} onChange={setV} label="Hot Readings" />;
  },
};

export const On: Story = {
  render: () => <Toggle value onChange={() => {}} label="Notifications" />,
};

export const Disabled: Story = {
  render: () => <Toggle value={false} onChange={() => {}} disabled label="Disabled" />,
};

export const StackedPreferences: Story = {
  render: () => {
    const [alerts, setAlerts] = useState(true);
    const [team, setTeam] = useState(false);
    const [push, setPush] = useState(true);
    return (
      <YStack gap="$3" width={280}>
        <Toggle value={alerts} onChange={setAlerts} label="Heat alerts" />
        <Toggle value={team} onChange={setTeam} label="Team scan synced" />
        <Toggle value={push} onChange={setPush} label="Push notifications" />
      </YStack>
    );
  },
};
