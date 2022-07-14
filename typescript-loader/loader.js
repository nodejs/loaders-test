// 💡 It's probably a good idea to put this loader near the end of the chain.

import path from 'node:path';

import { transform } from 'esbuild';


const tsExts = new Set([
  '.tsx',
  '.ts',
  '.mts',
  '.cts',
]);

export async function resolve(specifier, context, nextResolve) {
  const ext = path.extname(specifier);

  if (!tsExts.has(ext)) { return nextResolve(specifier); } // File is not ts, so step aside

  const { url } = await nextResolve(specifier); // This can be deduplicated but isn't for simplicity

  return {
    format: 'typescript', // Provide a signal to `load`
    shortCircuit: true,
    url,
  };
}

export async function load(url, context, nextLoad) {
  if (context.format !== 'typescript') { return nextLoad(url); }

  const rawSource = '' + (await nextLoad(url, { ...context, format: 'module' })).source;

  const { code: transpiledSource } = await transform(rawSource, {
    format: 'esm',
		loader: 'ts',
		sourcemap: 'inline',
		target: 'esnext',
  });

  return {
    format: 'module',
    shortCircuit: true,
    source: transpiledSource,
  };
}
