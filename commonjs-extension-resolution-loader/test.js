import { ok } from 'assert';
import { spawn } from 'child_process';
import { execPath } from 'process';


// Run this test yourself with debugging mode via:
// node --inspect-brk --experimental-loader ./loader.js ./fixtures/index.js

const child = spawn(execPath, [
  '--experimental-loader',
  './loader.js',
  './fixtures/index.js'
]);

let stdout = '';
child.stdout.setEncoding('utf8');
child.stdout.on('data', (data) => {
  stdout += data;
});

child.on('close', (code, signal) => {
	stdout = stdout.toString();
  ok(stdout.includes('hello from file.js'));
  ok(stdout.includes('hello from folder/index.js'));
});
