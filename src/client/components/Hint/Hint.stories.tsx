import type { Meta, StoryObj } from '@storybook/react';

import Hint from './index';

const meta = {
	title: 'App Components/Hint',
	component: Hint,
	parameters: {
		docs: {
			description: {
				component: 'Shows text under controls',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		disabled: { control: 'boolean' },
		invalid: { control: 'boolean' },
		children: { control: 'text' },
	},
} satisfies Meta<typeof Hint>;

export default meta;
type Story = StoryObj<typeof meta>;

// Stories
export const Default: Story = {
	args: {
		children: 'This is a hint',
	},
};

export const Disabled: Story = {
	args: {
		disabled: true,
		children: 'This hint is disabled',
	},
};

export const Invalid: Story = {
	args: {
		invalid: true,
		children: 'This hint is erroneous',
	},
};
