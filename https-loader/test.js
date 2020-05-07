import { ok } from 'assert';
import { spawn } from 'child_process';
import { execPath } from 'process';


// Run this test yourself with debugging mode via:
// node --inspect-brk --experimental-loader ./loader.js ./fixture.js

const child = spawn(execPath, [
  '--experimental-loader',
  './loader.js',
  './fixture.js'
]);

let stdout = '';
child.stdout.setEncoding('utf8');
child.stdout.on('data', (data) => {
  stdout += data;
});

child.on('close', (code, signal) => {
  ok(/The browser-based version of CoffeeScript hosted at coffeescript\.org is: \d+\.\d+\.\d+/.test(stdout.toString()));
});
