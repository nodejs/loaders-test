// Ported from https://github.com/nodejs/node/blob/45f2258f74117e27ffced434a98ad6babc14f7fa/test/es-module/test-esm-specifiers-symlink.mjs

import { strictEqual } from 'node:assert';
import fs from 'node:fs/promises';
import { join } from 'node:path';
import { cwd, execPath, exit } from 'node:process';

import { spawnPromisified } from './common.js';


const tmpDir = join(cwd(), `.tmp.${Date.now()}`);
await fs.rm(tmpDir, { maxRetries: 3, recursive: true, force: true });
await fs.mkdir(tmpDir);

// Create the following file structure:
// ├── index.mjs
// ├── subfolder
// │   ├── index.mjs
// │   └── node_modules
// │       └── package-a
// │           └── index.mjs
// └── symlink.mjs -> ./subfolder/index.mjs
const entry = join(tmpDir, 'index.mjs');
const symlink = join(tmpDir, 'symlink.mjs');
const real = join(tmpDir, 'subfolder', 'index.mjs');
const packageDir = join(tmpDir, 'subfolder', 'node_modules', 'package-a');
const packageEntry = join(packageDir, 'index.mjs');
try {
  await fs.symlink(real, symlink);
} catch (err) {
  await cleanup();
  if (err.code !== 'EPERM') throw err;
  console.log('insufficient privileges for symlinks');
  exit(0);
}
await fs.mkdir(packageDir, { recursive: true });
await Promise.all([
  fs.writeFile(entry, 'import "./symlink.mjs";'),
  fs.writeFile(real, 'export { a } from "package-a/index.mjs"'),
  fs.writeFile(packageEntry, 'export const a = 1;'),
]);

const { code } = await spawnPromisified(execPath, [
  '--no-warnings',
  '--loader=./loader.js',
  entry,
]);
await cleanup();
strictEqual(code, 0);


async function cleanup() {
  return fs.rm(tmpDir, { maxRetries: 3, recursive: true, force: true });
}
