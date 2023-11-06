import type { Meta, StoryObj } from '@storybook/react';
import { h32 } from 'xxhashjs';
import * as React from 'react';
import type { IProps as ICellProps } from '../Cell/view';
import Cell from '../Cell';

import Field from './index';

const schema: ICellProps['bonus'][][] = [
	['w3', null, null, 'l2', null, null, null, 'w3', null, null, null, 'l2', null, null, 'w3'],
	[null, 'w2', null, null, null, 'l3', null, null, null, 'l3', null, null, null, 'w2', null],
	[null, null, 'w2', null, null, null, 'l2', null, 'l2', null, null, null, 'w2', null, null],
	['l2', null, null, 'w2', null, null, null, 'l2', null, null, null, 'w2', null, null, 'l2'],
	[null, null, null, null, 'w2', null, null, null, null, null, 'w2', null, null, null, null],
	[null, 'l3', null, null, null, 'l3', null, null, null, 'l3', null, null, null, 'l3', null],
	[null, null, 'l2', null, null, null, 'l2', null, 'l2', null, null, null, 'l2', null, null],
	['w3', null, null, 'l2', null, null, null, null, null, null, null, 'l2', null, null, 'w3'],
	[null, null, 'l2', null, null, null, 'l2', null, 'l2', null, null, null, 'l2', null, null],
	[null, 'l3', null, null, null, 'l3', null, null, null, 'l3', null, null, null, 'l3', null],
	[null, null, null, null, 'w2', null, null, null, null, null, 'w2', null, null, null, null],
	['l2', null, null, 'w2', null, null, null, 'l2', null, null, null, 'w2', null, null, 'l2'],
	[null, null, 'w2', null, null, null, 'l2', null, 'l2', null, null, null, 'w2', null, null],
	[null, 'w2', null, null, null, 'l3', null, null, null, 'l3', null, null, null, 'w2', null],
	['w3', null, null, 'l2', null, null, null, 'w3', null, null, null, 'l2', null, null, 'w3'],
];

function Component() {
	return (
		<Field>
			{schema.map((row, index) => (
				<div
					key={h32(JSON.stringify(row) + index, 0xabcd).toString()}
					style={{ width: '610px', gap: '1px', display: 'flex', margin: 0 }}
				>
					{row.map((bonus, i) => (
						<Cell key={h32((bonus || '') + i, 0xabcd).toString()} bonus={bonus} />
					))}
				</div>
			))}
		</Field>
	);
}

const meta = {
	title: 'App Components/Field',
	component: Component,
	parameters: {
		docs: {
			description: {
				component: 'A game field displays letters and bonuses"',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {},
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
