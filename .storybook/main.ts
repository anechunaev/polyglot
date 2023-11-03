import type { StorybookConfig } from '@storybook/react-webpack5';
const styleLoader = require('../config/base/styleLoader');

const config: StorybookConfig = {
	stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
	addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/addon-interactions',
        '@storybook/addon-styling-webpack',
        ({
			name: "@storybook/addon-styling-webpack",
			options: {
				rules: [
					styleLoader({
						isScss: true,
						isServer: false,
						prodEnv: false,
						exclude: /\?raw$/,
					}),
				],
			},
        }),
    ],
	framework: {
		name: '@storybook/react-webpack5',
		options: {},
	},
	docs: {
		autodocs: 'tag',
	},
};
export default config;
