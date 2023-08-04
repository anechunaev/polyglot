const path = require('node:path');
const TerserPlugin = require("terser-webpack-plugin");

const optimalConfig = {
	target: 'node18',
	entry: path.resolve(__dirname, '../../src/server/index.ts'),
	output: {
		path: path.resolve(__dirname, '../../dist/server'),
		filename: 'index.js',
		publicPath: '/',
		library: {
			name: 'app',
			type: 'var',
		},
		strictModuleExceptionHandling: true,
	},
	resolve: {
		alias: {
		},
		extensions: ['.js', '.ts', '.mjs', '.json'],
	},
	module: {
		rules: [
			{
				test: /\.m?(j|t)s$/,
				exclude: /node_modules/i,
				use: {
					loader: "swc-loader",
				},
			},
		],
	},
	mode: 'production',
	plugins: [
	],
	optimization: {
		nodeEnv: false,
		minimize: true,
		minimizer: [new TerserPlugin({
			parallel: true,
			minify: TerserPlugin.swcMinify,
			terserOptions: {
				format: {
					comments: false,
				},
			},
			extractComments: false,
		})],
		moduleIds: 'deterministic',
		chunkIds: 'deterministic',
		mangleExports: true,
		concatenateModules: true,
		innerGraph: true,
		sideEffects: true
	},
	stats: {
		logging: 'error'
	},
	infrastructureLogging: {
		level: 'error'
	},
	node: false,
}

const devOptimization = {
	chunkIds: 'named',
	moduleIds: 'named',
};

const prodOptimization = Object.assign({}, optimalConfig.optimization);

function createWebpackConfig({
	mode = 'production',
	output = {},
	entry = path.resolve(__dirname, '../../src/server/index.ts'),
	target = 'node18',
	aliases = {},
	extensions = [],
	rules = [],
	plugins = [],
	optimization = {},
}) {
	const config = Object.assign({}, optimalConfig);

	config.mode = mode;
	config.output = Object.assign({}, config.output, output);
	config.entry = entry;
	config.target = target;
	config.resolve.alias = Object.assign({}, config.resolve.alias, aliases);
	config.resolve.extensions = [...config.resolve.extensions, ...extensions];
	config.module.rules = [...config.module.rules, ...rules];
	config.plugins = [...config.plugins, ...plugins];
	config.optimization = Object.assign({}, mode === 'production' ? prodOptimization : devOptimization, optimization);
	config.devtool = mode === 'production' ? false : 'source-map';

	return config;
}

module.exports = {
	optimalConfig,
	devOptimization,
	prodOptimization,
	createWebpackConfig,
};
