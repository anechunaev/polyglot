const baseRules = require('./rules/common');
const baseTypescriptRules = require('./rules/typescript');

const config = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
    },
    plugins: [
        '@typescript-eslint',
        'prettier',
        'react-hooks',
        'deprecation',
    ],
    extends: [
        'airbnb',
        'airbnb/hooks',
        'prettier',
    ],
    env: {
        browser: true,
        node: true,
        amd: true,
        es6: true,
        jest: true,
    },
    ignorePatterns: [
        '*.d.ts',
        'config/**/*.js',
        '.eslintrc.js',
    ],
    rules: {
        ...baseRules,
    },
    overrides: [
        {
            files: ['**/*.ts', '**/*.tsx'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                project: './tsconfig.json',
                warnOnUnsupportedTypeScriptVersion: true,
            },
            plugins: ['prettier'],
            extends: [
                'airbnb-typescript',
                'airbnb/hooks',
                'prettier',
            ],
            rules: {
                ...baseTypescriptRules,
            },
            settings: {
                'import/resolver': {
                    typescript: {},
                },
            },
        },
    ],
}

module.exports = config;
