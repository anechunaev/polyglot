const path = require('node:path');
const { createWebpackConfig } = require('../base/createWebpackConfig');

module.exports = createWebpackConfig({
	target: 'web',
	entry: path.resolve(__dirname, '../../src/client/index.ts'),
	output: {
		path: path.resolve(__dirname, '../../dist/client'),
		filename: 'index.js',
	},
});
