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

  const tsExt = jsToTs.get(ext); // Get corresponding ts extension (ex .mjs → .mts)

  if (tsExt == null) { // File is not ts or js, so it's irrelevant
    return nextResolve(specifier, context);
  }

  try { // Check whether such a js file does exist
    return await nextResolve(specifier, context);
  } catch (err) {
    if (err?.code !== "ERR_MODULE_NOT_FOUND") { throw err; }
  }

  try { // Finally, check whether the corresponding ts file exists
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
