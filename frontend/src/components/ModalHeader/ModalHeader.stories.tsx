import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { ModalHeader } from './ModalHeader';

const meta: Meta<typeof ModalHeader> = {
  title: 'UI/ModalHeader',
  component: ModalHeader,
  parameters: {
    layout: 'centered',
  },
  args: {
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Title',
    description: 'Description',
  },
};
