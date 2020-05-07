import { ok } from 'assert';
import { spawn } from 'child_process';
import { execPath } from 'process';


// Run this test yourself with debugging mode via:
// node --inspect-brk --experimental-loader ./loader.js ./fixtures/esm-and-commonjs-imports.coffee

const child = spawn(execPath, [
  '--experimental-loader',
  './loader.js',
  './fixtures/esm-and-commonjs-imports.coffee'
]);

let stdout = '';
child.stdout.setEncoding('utf8');
child.stdout.on('data', (data) => {
  stdout += data;
});

child.on('close', (code, signal) => {
  stdout = stdout.toString();
  ok(stdout.includes('Hello from CoffeeScript', 'Main entry transpiles'));
  ok(stdout.includes('HELLO FROM ESM'), 'ESM import transpiles');
  ok(stdout.includes('Hello from CommonJS!'), 'CommonJS import transpiles');
});
