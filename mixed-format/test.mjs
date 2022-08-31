import assert from 'node:assert';

import { foo } from './fixture/esm.js';
import { qux } from './fixture/cjs.js';


assert.strictEqual(foo, 'bar');
assert.strictEqual(qux, 'zed');
