import { ok } from 'assert';
import { spawn } from 'child_process';
import { execPath } from 'process';

// Run this test yourself with debugging mode via:
// node --inspect-brk --experimental-loader ./loader.js ./fixtures/esm-and-commonjs-imports.coffee

const child = spawn(execPath, [
  '--experimental-loader',
  './loader.js',
  './fixtures/esm-and-commonjs-imports.coffee',
]);
let stdout = '';
child.stdout.setEncoding('utf8');
child.stdout.on('data', (data) => {
  stdout += data;
});
let stderr = '';
child.stderr.setEncoding('utf8');
child.stderr.on('data', (data) => {
  stderr += data;
});

child.on('close', (code, signal) => {
  ok(stdout.includes('Hello from CoffeeScript'), 'Main entry transpiles');
  ok(stdout.includes('HELLO FROM ESM'), 'ESM import transpiles');
  ok(stdout.includes('Hello from CommonJS!'), 'Named CommonJS import fails');
});
