import type { Meta, StoryObj } from '@storybook/react';

import NoSSR from './index';

const description = `The \`<NoSSR>\` component allows preventing server-side rendering for a child component tree.
This is useful for components that rely on browser-only features like scripts, DOM measurements, etc.`;

const meta = {
	title: 'App Components/NoSSR',
	component: NoSSR,
	parameters: {
		docs: {
			description: {
				component: description,
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		fallback: { controls: 'text' },
	},
} satisfies Meta<typeof NoSSR>;

export default meta;
type Story = StoryObj<typeof meta>;

// Stories
export const Default: Story = {
	args: {
		fallback: 'Loading...',
	},
};
