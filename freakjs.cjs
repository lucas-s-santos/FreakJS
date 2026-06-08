#!/usr/bin/env node
// FreakJS CLI launcher — requires Bun (https://bun.sh)
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const r = spawnSync(
  'bun',
  [path.join(__dirname, 'cli/index.ts'), ...process.argv.slice(2)],
  { stdio: 'inherit' }
);
process.exit(r.status ?? 0);
