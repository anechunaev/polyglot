const path = require('node:path');
const webpack = require("webpack");
const { createWebpackConfig } = require('../base/createWebpackConfig');
const styleLoader = require('../base/styleLoader');
const imageLoader = require('../base/imageLoader');

module.exports = createWebpackConfig({
	mode: 'development',
	target: 'web',
	entry: {
		index: path.resolve(__dirname, '../../src/client/index.tsx'),
		global: path.resolve(__dirname, '../../src/client/global.scss'),
	},
	output: {
		path: path.resolve(__dirname, '../../dist/client'),
		filename: '[name].[contenthash].js',
	},
	rules: [
		styleLoader({
			isScss: true,
			prodEnv: false,
		}),
		imageLoader({}),
	],
	plugins: [
		new webpack.DefinePlugin({
			process: {env: {}}
		}),
	],
});
