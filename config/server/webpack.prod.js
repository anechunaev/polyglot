const path = require('node:path');
const nodeExternals = require('webpack-node-externals');
const { createWebpackConfig } = require('../base/createWebpackConfig');

module.exports = createWebpackConfig({
	entry: path.resolve(__dirname, '../../src/server/index.ts'),
	output: {
		path: path.resolve(__dirname, '../../dist/server'),
		filename: 'index.js',
	},
	externals: [nodeExternals()]
});
