import { match, strictEqual } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { execPath } from 'node:process';
import { fileURLToPath } from 'node:url';

// Run this test yourself with debugging mode via:
// node --inspect-brk --experimental-loader ./loader.js ./fixtures/index….js

const loader = fileURLToPath(new URL(
  './loader.js',
  import.meta.url
));

const fixture = fileURLToPath(new URL('./fixtures/index.js', import.meta.url));

const { status, stderr, stdout } = spawnSync(
  execPath,
  [
    '--no-warnings',
    '--experimental-loader',
    loader,
    fixture,
  ],
  { encoding: 'utf8' },
);

strictEqual(stderr, '');

match(stdout, /sum: 7/);
match(stdout, /VERSION: 42/);

strictEqual(status, 0);
