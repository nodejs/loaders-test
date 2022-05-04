import { fileURLToPath } from 'url';
import { ok, strictEqual } from 'assert';
import { spawnSync } from 'child_process';
import { execPath } from 'process';

// Run this test yourself with debugging mode via:
// node --inspect-brk --experimental-loader ./loader.js ./fixtures/esm-and-commonjs-imports.coffee

const loader = fileURLToPath(new URL(
  './loader.js',
  import.meta.url
));
const fixture = fileURLToPath(new URL(
  './fixtures/esm-and-commonjs-imports.coffee',
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
ok(stdout.includes('Hello from CoffeeScript'), 'Main entry transpiles');
ok(stdout.includes('HELLO FROM ESM'), 'ESM import transpiles');
ok(stdout.includes('Hello from CommonJS!'), 'Named CommonJS import fails');
