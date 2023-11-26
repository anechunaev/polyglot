import type { Meta, StoryObj } from '@storybook/react';

import Input from './index';

const meta = {
	title: 'App Components/Input',
	component: Input,
	parameters: {
		docs: {
			description: {
				component: 'Handles text input.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		disabled: { control: 'boolean' },
		placeholder: { control: 'text' },
		label: { control: 'text' },
		hint: { control: 'text' },
	},
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// Stories
export const Default: Story = {
	args: {
		disabled: false,
		placeholder: '',
		label: '',
		hint: '',
	},
};

export const WithLabelHintAndPlaceholder: Story = {
	args: {
		placeholder: 'Например, «Магистр Рэкс»',
		label: 'Ваше имя',
		hint: 'Придумайте что-нибудь покруче',
	},
};

export const WithValue: Story = {
	args: {
		value: 'Значение, которое уже в поле',
	},
};

export const Disabled: Story = {
	args: {
		disabled: true,
		label: 'Дизейбленный лэйбл',
		hint: 'И его задизейбленный хинт',
	},
};

export const WithPlaceholder: Story = {
	args: {
		placeholder: 'Ваше имя',
	},
};

export const WithErrorInHint: Story = {
	args: {
		invalid: true,
		label: 'Введите «300»',
		value: '400',
		hint: 'Не вводите «400»',
	},
};
