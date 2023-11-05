import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Container from '../Showcase-container';
import Cell from './index';

function Component() {
	return (
		<Container>
			<Cell bonus="w3" />
			<Cell bonus="w2" />
			<Cell bonus="l3" />
			<Cell bonus="l2" />
			<Cell bonus={null} />
		</Container>
	);
}

const meta = {
	title: 'App Components/Cell',
	component: Component,
	parameters: {
		docs: {
			description: {
				component: 'Could be a part of the field or a letter "container"',
			},
		},
	},
	tags: ['autodocs'],
} satisfies Meta<typeof Cell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
