import type { Meta, StoryObj } from '@storybook/react';

import Label from './index';

const meta = {
	title: 'App Components/Label',
	component: Label,
	parameters: {
		docs: {
			description: {
				component: 'Shows text above controls',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		disabled: { control: 'boolean' },
		children: { control: 'text' },
	},
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

// Stories
export const Default: Story = {
	args: {
		disabled: false,
		children: 'This is a text label',
	},
};

export const Disabled: Story = {
	args: {
		disabled: true,
		children: 'This label is disabled',
	},
};
