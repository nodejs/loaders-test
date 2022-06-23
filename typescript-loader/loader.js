// 💡 It's probably a good idea to put this loader near the end of the chain.

import path from 'node:path';

import { transform } from 'esbuild';

const jsToTs = new Map([
  // Sorted by priority (first wins)
  ['.js',  '.ts' ],
  ['.cjs', '.cts'],
  ['.mjs', '.mts'],
  ['.jsx', '.tsx'],
]);
const jsExts = new Set(jsToTs.keys());
const tsExts = new Set(jsToTs.values());

export async function resolve(specifier, context, nextResolve) {
  const { base, ext, name } = path.parse(specifier);

  if (tsExts.has(ext)) { // No guessing needed
    const { url } = await nextResolve(specifier, context);

    return {
      format: 'typescript', // Provide a signal to `load`
      shortCircuit: true,
      url,
    };
  }

  if (!jsExts.has(ext)) { // When file is not ts or js, it's irrelevant
    return nextResolve(specifier, context);
  }

  try { // Check whether such a js file does exist
    return await nextResolve(specifier, context);
  } catch (err) {
    if (err?.code !== "ERR_MODULE_NOT_FOUND") { throw err; }
  }

  for (const tsExt of tsExts) { // Finally, check whether any ts file exists
    try {
      const maybePath = specifier.replace(base, `${name}${tsExt}`);
      const { url } = await nextResolve(maybePath, context);

      return {
        format: 'typescript', // Provide a signal to `load`
        shortCircuit: true,
        url,
      };
    } catch (err) {
      if (err?.code !== "ERR_MODULE_NOT_FOUND") { throw err; }
    }
  }
}

export async function load(url, context, nextLoad) {
  if (context.format !== 'typescript') { return nextLoad(url, context); }

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
