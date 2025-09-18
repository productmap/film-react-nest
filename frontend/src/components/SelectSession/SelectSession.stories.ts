import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { SelectSession } from './SelectSession';

const meta: Meta<typeof SelectSession> = {
  title: 'UI/SelectSession',
  component: SelectSession,
  parameters: {
    layout: 'centered',
  },
  args: {
    onSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Добавлено недостающее свойство 'selected' для соответствия типу компонента
    selected: null,
    sessions: [
        {
            id: '1',
            day: 'Monday',
            time: '10:00',
        },
        {
          id: '1',
          day: 'Monday',
          time: '12:00',
        },
        {
            id: '2',
            day: 'Tuesday',
            time: '11:00',
        },
        {
            id: '3',
            day: 'Wednesday',
            time: '12:00',
        },
    ]
  },
};
