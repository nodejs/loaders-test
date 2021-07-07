import { ok } from 'assert';
import { spawn } from 'child_process';
import { execPath } from 'process';
import { fileURLToPath, URL } from 'url';


// Run this test yourself with debugging mode via:
// node --inspect-brk --experimental-loader ./loader.js ./fixtures/esm-and-commonjs-imports.coffee

const child = spawn(execPath, [
  '--experimental-loader',
  fileURLToPath(new URL('./loader.js', import.meta.url).href),
  fileURLToPath(new URL('./fixtures/esm-and-commonjs-imports.coffee', import.meta.url).href),
]);

console.log({ args: child.spawnargs })

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
  console.log(stdout)
  console.error(stderr)
  ok(stdout.includes('Hello from CoffeeScript', 'Main entry transpiles'));
  ok(stdout.includes('HELLO FROM ESM'), 'ESM import transpiles');
  ok(stdout.includes('Hello from CommonJS!'), 'CommonJS import transpiles');
});
