// 💡 It's probably a good idea to put this loader near the end of the chain.

import path from 'node:path';

import tsc from 'typescript';

const tsExts = new Set(['.mts', '.ts', '.tsx']);

export function resolve(specifier, context, nextResolve) {
  if (!isTypeScriptFile(specifier, context)) { return nextResolve(specifier, context); }

  const { base, name } = path.parse(specifier);

  for (const tsExt of tsExts) {
    const maybeRealFilepath = specifier.replace(base, `${name}${tsExt}`);

    try {
      const { url } = nextResolve(maybeRealFilepath, context);

      return {
        format: 'typescript', // Provide a signal to `load`
        shortCircuit: true,
        url,
      };
    } catch(err) { if (err.code !== 'ERR_MODULE_NOT_FOUND') throw err }
  }

  // ❗️ File does not exist. Call nextResolve to get an appropriate error from Node
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (context.format !== 'typescript') return nextLoad(url, context);

  const { source: rawSource } = (await nextLoad(url, {
    ...context,
    format: 'module',
    importAssertions: {}, // 'typescript' is not a valid type assertion, so don't pass it into Node
  }));

  const { outputText: transpiledSource } = tsc.transpileModule(''+rawSource, {
    compilerOptions: {
      allowJs: true,
      target: 'esnext',
    },
  });

  return {
    format: 'module',
    shortCircuit: true,
    source: transpiledSource,
  };
}

function isTypeScriptFile(specifier, context) {
  const ext = path.extname(specifier);

  if (tsExts.has(ext)) return true;
  if (context.importAssertions.type === 'typescript') return true;

  return false;
}
