const { spawnSync } = require('node:child_process');
const { readdirSync } = require('node:fs');
const { join, dirname } = require('node:path');
const stageTests = readdirSync(__dirname).filter(name => name.endsWith('.test.cjs')).map(name => join(__dirname, name));
const vitest = join(dirname(require.resolve('vitest/package.json')), 'vitest.mjs');
for (const args of [['--test', ...stageTests], [vitest, 'run']]) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.error) { console.error(result.error); process.exit(1); }
  if (result.status !== 0) process.exit(result.status ?? 1);
}
