import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Card } from './Card';
import {CDN_URL} from "../../utils/constants.ts";

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  args: {
    onClick: fn()
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: '1',
    image: `${CDN_URL}/bg1s.jpg`,
    // Исправлено свойство text на title в соответствии с пропсами компонента
    title: 'Архитекторы общества',
  },
};
