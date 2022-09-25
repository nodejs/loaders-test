// Adapted from https://github.com/nodejs/node/blob/45f2258f74117e27ffced434a98ad6babc14f7fa/test/es-module/test-esm-specifiers.mjs

import { match, strictEqual } from 'node:assert';
import { join } from 'node:path';
import { execPath } from 'node:process';
import { describe, it } from 'node:test';

import { spawnPromisified } from './common.js';


describe('ESM: specifier-resolution=node', { concurrency: true }, () => {
  it(async () => {
    const { code, stderr, stdout } = await spawnPromisified(execPath, [
      '--no-warnings',
      '--loader=./loader.js',
      '--input-type=module',
      '--eval',
      [
        'import { strictEqual } from "node:assert";',
        // commonJS index.js
        `import commonjs from ${JSON.stringify('./test/fixtures/es-module-specifiers/package-type-commonjs')};`,
        // esm index.js
        `import module from ${JSON.stringify('./test/fixtures/es-module-specifiers/package-type-module')};`,
        // Notice the trailing slash
        `import success, { explicit, implicit, implicitModule } from ${JSON.stringify('./test/fixtures/es-module-specifiers/')};`,
        'strictEqual(commonjs, "commonjs");',
        'strictEqual(module, "module");',
        'strictEqual(success, "success");',
        'strictEqual(explicit, "esm");',
        'strictEqual(implicit, "cjs");',
        'strictEqual(implicitModule, "cjs");',
      ].join('\n'),
    ]);

    strictEqual(stderr, '');
    strictEqual(stdout, '');
    strictEqual(code, 0);
  });

  it('should throw when the omitted file extension is .mjs (legacy loader doesn\'t support it)', async () => {
    const { code, stderr, stdout } = await spawnPromisified(execPath, [
      '--no-warnings',
      '--loader=./loader.js',
      '--input-type=module',
      '--eval',
      `import whatever from ${JSON.stringify('./test/fixtures/es-module-specifiers/implicit-main-type-commonjs')};`,
    ]);

    match(stderr, /ERR_MODULE_NOT_FOUND/);
    strictEqual(stdout, '');
    strictEqual(code, 1);
  });

  for (
    const item of [
      'package-type-commonjs',
      'package-type-module',
      '/',
      '/index',
    ]
  ) it('should ', async () => {
    const { code } = await spawnPromisified(execPath, [
      '--no-warnings',
      '--loader=./loader.js',
      join('./test/fixtures/es-module-specifiers', item),
    ]);

    strictEqual(code, 0);
  });
});
