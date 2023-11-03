import * as React from 'react';
import type { Preview } from '@storybook/react';
import styles from './preview.scss';

const preview: Preview = {
	parameters: {
		actions: { argTypesRegex: '^on[A-Z].*' },
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
};

export const decorators = [
	(Story) => (
		<div className={styles.container}>
			<Story />
		</div>
	),
];

export default preview;
