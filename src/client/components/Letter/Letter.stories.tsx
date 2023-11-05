import * as React from 'react';
import { h32 } from 'xxhashjs';
import type { Meta, StoryObj } from '@storybook/react';
import letters from '../../../server/config/letters_rus.json';
import Container from '../Showcase-container';
import Letter from './index';
import Cell from '../Cell';

function Component() {
	return (
		<>
			{letters.map((letter, i) => (
				<Cell key={h32(`${letter.name + i}row`, 0xabcd).toString()} bonus={null}>
					<Letter
						key={h32(letter.name + i, 0xabcd).toString()}
						letter={{ price: letter.price, value: letter.name }}
					/>
				</Cell>
			))}
		</>
	);
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
		letter: {
			price: {
				control: 'string',
			},
			value: {
				control: 'string',
			},
		},
	},
} satisfies Meta<typeof Letter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		letter: {
			price: 10,
			value: 'Щ',
		},
	},
};
