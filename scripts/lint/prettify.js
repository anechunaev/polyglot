#!/usr/bin/env node

const gitHelpers = require('../helpers/git');
const prettierHelpers = require('../helpers/prettier');
 
async function run() {
    try {
        const files = await gitHelpers.getCurrentChanges();
        if (!files.length) return process.exitCode = 0;
        process.exitCode = await prettierHelpers.prettify(files.join(' '));
        await gitHelpers.stageFiles(files.join(' '));
    } catch (errorResponse) {
        process.exitCode = 127;
        throw error;
    }
}

run()
    .then(() => console.log(`✅ Prettifying done (exit code ${process.exitCode})`))
    .catch((error) => console.error('❌ Error while running prettier:\n', error))
