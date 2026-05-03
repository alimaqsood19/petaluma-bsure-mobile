import type { Meta, StoryObj } from '@storybook/react';
import { YStack } from 'tamagui';

import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Foundations/Input',
  component: Input,
  args: { placeholder: 'Type here', label: 'Horse Name' },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const WithHelperText: Story = {
  args: { helperText: 'As shown on registration papers.' },
};

export const Required: Story = { args: { required: true } };

export const WithError: Story = {
  args: { error: 'Name is required.', defaultValue: '' },
};

export const Disabled: Story = { args: { disabled: true, defaultValue: 'Buttercup' } };

export const Sizes: Story = {
  render: () => (
    <YStack gap="$3">
      <Input size="sm" label="Small" placeholder="Small" />
      <Input size="md" label="Medium" placeholder="Medium" />
      <Input size="lg" label="Large" placeholder="Large" />
    </YStack>
  ),
};

export const SignupForm: Story = {
  render: () => (
    <YStack gap="$3" width={320}>
      <Input label="First & Last Name" required placeholder="Type here" />
      <Input label="Role" placeholder="Type here" />
      <Input label="Stable Name" required placeholder="Select" />
      <Input label="Discipline" required placeholder="Select" />
    </YStack>
  ),
};
