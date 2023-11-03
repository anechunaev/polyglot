import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';

function Button({ label, ...props }: { label: string }) {
	return React.createElement(
		'button',
		{
			type: 'button',
			...props,
		},
		label,
	);
}

const meta = {
	title: 'Design System/Library/Button',
	component: Button,
	parameters: {
		docs: {
			description: {
				component: 'Just a button',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		label: { control: 'text' },
	},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Stories
export const Primary: Story = {
	args: {
		label: 'Button',
	},
};

export const Secondary: Story = {
	args: {
		label: 'Button #2',
	},
};
