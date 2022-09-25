import { match } from 'assert';
import { spawn } from 'child_process';
import { execPath } from 'process';


// Run this test yourself with debugging mode via:
// node --inspect-brk --loader ./loader.js ./fixtures/index.js

const child = spawn(execPath, [
  '--loader',
  './loader.js',
  './test/basic-fixtures/index.js'
]);

let stdout = '';
child.stdout.setEncoding('utf8');
child.stdout.on('data', data => {
  stdout += data;
});

child.on('close', (_code, _signal) => {
  stdout = stdout.toString();
  match(stdout, /hello from file\.js/);
  match(stdout, /hello from folder\/index\.js/);
});
