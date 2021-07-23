import { ok } from 'assert';
import { spawn } from 'child_process';
import { execPath } from 'process';
import { fileURLToPath, URL } from 'url';


// Run this test yourself with debugging mode via:
// node --inspect-brk --experimental-loader ./loader.js ./fixture.js

const child = spawn(execPath, [
  '--experimental-loader',
  fileURLToPath(new URL('./loader.js', import.meta.url).href),
  fileURLToPath(new URL('./fixture.js', import.meta.url).href),
]);

let stdout = '';
child.stdout.setEncoding('utf8');
child.stdout.on('data', (data) => {
  stdout += data;
});

child.on('close', (code, signal) => {
  console.log(`stdout "${stdout}"`)
  ok(/The browser-based version of CoffeeScript hosted at coffeescript\.org is: \d+\.\d+\.\d+/.test(stdout.toString()));
});
