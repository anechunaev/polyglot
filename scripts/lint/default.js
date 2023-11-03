#!/usr/bin/env node

const gitHelpers = require('../helpers/git');
const eslintHelpers = require('../helpers/eslint');
 
async function run() {
    try {
        const files = await gitHelpers.getCurrentChanges();
        if (!files.length) return process.exitCode = 0;
        process.exitCode = await eslintHelpers.lint(files.join(' '));
    } catch (errorResponse) {
        process.exitCode = 127;
        throw error;
    }
}

run()
    .then(() => console.log(`✅ Linting done (exit code ${process.exitCode})`))
    .catch((error) => console.error('❌ Error while running linter:\n', error))
