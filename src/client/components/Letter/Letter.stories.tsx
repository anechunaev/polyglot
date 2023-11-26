import * as React from 'react';
import { h32 } from 'xxhashjs';
import type { Meta, StoryObj } from '@storybook/react';
import uuid4 from 'uuid4';
import data from './data.json';
import Container from '../Showcase-container';
import Letter from './index';
import Cell from '../Cell';

function Component() {
	return Object.keys(data.letters).map((letterId) => (
		<Cell key={h32(`${`${uuid4()}r`}`, 0xabcd).toString()} bonus={null}>
			<Letter key={uuid4()} letterId={letterId} />
		</Cell>
	));
}

const meta = {
	title: 'App Components/Letter',
	component: Component,
	decorators: [
		(Story) => (
			<Container>
				<Story />
			</Container>
		),
	],
	parameters: {
		docs: {
			description: {
				component: 'A component that display letter with price"',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		letterId: {
			control: 'string',
		},
	},
} satisfies Meta<typeof Letter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		letterId: '117',
	},
};
