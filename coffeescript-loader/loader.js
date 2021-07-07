import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { URL, pathToFileURL } from 'url';

import CoffeeScript from 'coffeescript';


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
    // CoffeeScript files can be either CommonJS or ES modules, so we want any
    // CoffeeScript file to be treated by Node.js the same as a .js file would
    // be at the same location (based on the "type" field in the nearest
    // parent package.json file). To determine how Node.js would interpret an
    // arbitrary .js file, append .js to our CoffeeScript URL and see what
    // format Node.js returns for such a URL. If 'commonjs' is returned, a
    // handler will need to be registered with require.extensions to process
    // that file via the CommonJS loader.
    const { format } = await defaultLoad(`${url}.js`, context);

    // source is ignored (never checked) for cjs, so safe to omit
    if (format === 'commonjs') return { format };

    const { source: rawSource } = await defaultLoad(url, { format });
    // This hook converts CoffeeScript source code into JavaScript source code
    // for all imported CoffeeScript files.
    const transformedSource = CoffeeScript.compile(rawSource, {
      bare: true,
      filename: url,
    });

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
    return CoffeeScript.compile(source, {bare: true, filename});
  }
})
