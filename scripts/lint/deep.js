#!/usr/bin/env node

const gitHelpers = require('../helpers/git');
const eslintHelpers = require('../helpers/eslint');
 
async function run() {
    // try {
    //     const files = await gitHelpers.getCurrentChanges();
    //     process.exitCode = await eslintHelpers.lint(files.join(' '));
    // } catch (errorResponse) {
    //     process.exitCode = 127;
    //     throw error;
    // }
    const res = await gitHelpers.getMainBranch();
    console.log('>>', res);
}

run()
    .then(() => console.log(`✅ Deep linting done (exit code ${process.exitCode})`))
    .catch((error) => console.error('❌ Error while running linter:\n', error))
