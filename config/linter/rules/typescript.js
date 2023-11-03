const baseRules = require('./common');

module.exports = {
	...baseRules,
	'@typescript-eslint/indent': 'off',
	'@typescript-eslint/no-use-before-define': ['error', { functions: false, classes: false }],
	// https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/lines-between-class-members.md
	'@typescript-eslint/lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
};
