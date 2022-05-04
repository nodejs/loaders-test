import { fileURLToPath } from 'url';
import { ok, strictEqual } from 'assert';
import { spawnSync } from 'child_process';
import { execPath } from 'process';

// Run this test yourself with debugging mode via:
// node --inspect-brk --experimental-loader ./loader.js ./fixture.js

const loader = fileURLToPath(new URL(
  './loader.js',
  import.meta.url
));
const fixture = fileURLToPath(new URL(
  './fixture.js',
  import.meta.url
));

const { status, stderr, stdout } = spawnSync(
  execPath,
  [
    '--experimental-loader',
    loader,
    fixture,
  ],
  { encoding: 'utf8' },
);

console.error(stderr);


strictEqual(status, 0);
ok(/The browser-based version of CoffeeScript hosted at coffeescript\.org is: \d+\.\d+\.\d+/.test(stdout.toString()));
