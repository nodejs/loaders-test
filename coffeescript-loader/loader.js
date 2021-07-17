import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { dirname } from 'path';
import {
  fileURLToPath,
  pathToFileURL,
  URL,
} from 'url';

import CoffeeScript from 'coffeescript';

import getPackageType from './getPackageType.js';


const baseURL = pathToFileURL(process.cwd() + '/').href;

// CoffeeScript files end in .coffee, .litcoffee or .coffee.md.
const extensionsRegex = /\.coffee$|\.litcoffee$|\.coffee\.md$/;

export async function resolve(specifier, context, defaultResolve) {
  const { parentURL = baseURL } = context;

  // Node.js normally errors on unknown file extensions, so return a URL for
  // specifiers ending in the CoffeeScript file extensions.
  if (extensionsRegex.test(specifier)) {
    return {
      url: new URL(specifier, parentURL).href
    };
  }

  // Let Node.js handle all other specifiers.
  return defaultResolve(specifier, context, defaultResolve);
}

export async function load(url, context, defaultLoad) {
  // Now that we patched resolve to let CoffeeScript URLs through, we need to
  // tell Node.js what format such URLs should be interpreted as. Because
  // CoffeeScript transpiles into JavaScript, it should be one of the two
  // JavaScript formats: 'commonjs' or 'module'.
  if (extensionsRegex.test(url)) {
console.log({ url })
    // CoffeeScript files can be either CommonJS or ES modules, but since load
    // handles both format and source based on the same url, it cannot be used
    // for non-js files. Instead, a quick search up the filesystem for a
    // package.json with a `type` field settles the format issue.
    const format = await getPackageType(dirname(fileURLToPath(url)));

    // source is ignored (never checked) for cjs, so safe to omit
    if (format === 'commonjs') return { format };

    const { source: rawSource } = await defaultLoad(url, { format });
    // This hook converts CoffeeScript source code into JavaScript source code
    // for all imported CoffeeScript files.
    const transformedSource = CoffeeScript.compile(''+rawSource, {
      bare: true,
      filename: url,
    });
console.log('source transformed')

    return {
      format,
      source: transformedSource,
    };
  }

  // Let Node.js handle all other URLs.
  return defaultLoad(url, context, defaultLoad);
}


// Register CoffeeScript to also transform CommonJS files. This can more
// thoroughly be done for CoffeeScript specifically via
// `CoffeeScript.register()`, but for purposes of this example this is the
// simplest method.
const require = createRequire(import.meta.url);
['.coffee', '.litcoffee', '.coffee.md'].forEach(extension => {
  require.extensions[extension] = (module, filename) => {
    const source = readFileSync(filename, 'utf8');
    const transformedSource = CoffeeScript.compile(source, { bare: true, filename });
console.log({ [filename]: transformedSource })
    return transformedSource
  }
})
