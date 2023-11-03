import type { Meta, StoryObj } from '@storybook/react';

import TurnTimer from './index';

const meta = {
	title: 'App Components/TurnTimer',
	component: TurnTimer,
	parameters: {
		docs: {
			description: {
				component: 'Handles timer logic and displaying ticking numbers.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		threshold: { control: 'number' },
		seconds: { control: 'number' },
		remainSeconds: { control: 'number' },
	},
} satisfies Meta<typeof TurnTimer>;

export default meta;
type Story = StoryObj<typeof meta>;

// Stories
export const Default: Story = {
	args: {
		threshold: 30,
		seconds: 60,
		remainSeconds: 60,
	},
};
