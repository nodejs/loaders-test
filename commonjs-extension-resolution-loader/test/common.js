// Ported from https://github.com/nodejs/node/blob/45f2258f74117e27ffced434a98ad6babc14f7fa/test/common/index.js

import { spawn } from 'node:child_process';


export function spawnPromisified(...args) {
  let stderr = '';
  let stdout = '';

  const child = spawn(...args);
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (data) => { stderr += data; });
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (data) => { stdout += data; });

  return new Promise((resolve, reject) => {
    child.on('close', (code, signal) => {
      resolve({
        code,
        signal,
        stderr,
        stdout,
      });
    });
    child.on('error', (code, signal) => {
      reject({
        code,
        signal,
        stderr,
        stdout,
      });
    });
  });
}
