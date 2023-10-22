const path = require('node:path');
const webpack = require("webpack");

const { createWebpackConfig } = require('../base/createWebpackConfig');

module.exports = createWebpackConfig({
	target: 'web',
	entry: path.resolve(__dirname, '../../src/client/index.tsx'),
	output: {
		path: path.resolve(__dirname, '../../dist/client'),
		filename: 'index.js',
	},
	rules: [
		{
			test: /\.tsx?$/,
			use: 'ts-loader',
			exclude: /node_modules/,
		}
	],
	plugins: [
		new webpack.DefinePlugin({
			process: {env: {}}
		  })
	]
});
