const path = require('node:path');
const webpack = require("webpack");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { createWebpackConfig } = require('../base/createWebpackConfig');
const styleLoader = require('../base/styleLoader');
const imageLoader = require('../base/imageLoader');

module.exports = createWebpackConfig({
	target: 'web',
	entry: {
		global: path.resolve(__dirname, '../../src/client/global.scss'),
		index: path.resolve(__dirname, '../../src/client/index.tsx'),
	},
	output: {
		path: path.resolve(__dirname, '../../dist/client'),
		filename: '[name].[contenthash].js',
	},
	rules: [
		styleLoader({
			isScss: true,
			prodEnv: true,
		}),
		imageLoader({}),
	],
	plugins: [
		new webpack.DefinePlugin({
			process: {env: {}}
		}),
		new MiniCssExtractPlugin({
			filename: '[name].[contenthash].css',
		}),
	],
});
