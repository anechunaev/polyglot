#!/usr/bin/env node

const cp = require('node:child_process');
 
async function run() {
    if (process.env.CI) return;
    await cp.exec('husky install');
    await cp.exec('npx husky add .husky/pre-commit "npm run lint"');
    await cp.exec('npx husky add .husky/pre-push "npm run lint:deep"');
}

run()
    .then(() => console.log(`✅ Git hooks installed`))
    .catch((error) => console.error('❌ Error while installing hooks:\n', error))
