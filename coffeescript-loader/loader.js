import { readFile } from 'fs/promises';
import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { dirname, extname, resolve as resolvePath } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

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
    // CoffeeScript file to be treated by Node.js the same as a .js file at the
    // same location. To determine how Node.js would interpret an arbitrary .js
    // file, search up the file system for the nearest parent package.json file
    // and read its "type" field.
    const format = await getPackageType(url);
    // When a hook returns a format of 'commonjs', `source` is be ignored.
    // To handle CommonJS files, a handler needs to be registered with
    // `require.extensions` in order to process the files with the CommonJS
    // loader. Avoiding the need for a separate CommonJS handler is a future
    // enhancement planned for ES module loaders.
    if (format === 'commonjs') {
      return { format };
    }

    const { source: rawSource } = await defaultLoad(url, { format });
    // This hook converts CoffeeScript source code into JavaScript source code
    // for all imported CoffeeScript files.
    const transformedSource = CoffeeScript.compile(rawSource.toString(), {
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

async function getPackageType(url) {
  const isFile = !!extname(url);
  const dir = isFile
    ? dirname(fileURLToPath(url))
    : url;
  const packagePath = resolvePath(dir, 'package.json');

  const type = await readFile(packagePath, { encoding: 'utf8' })
    .then((filestring) => JSON.parse(filestring).type)
    .catch((err) => {
      if (err?.code !== 'ENOENT') console.error(err);
    });

  if (type) return type;

  return dir.length > 1 && getPackageType(resolvePath(dir, '..'));
}


// Register CoffeeScript to also transform CommonJS files. This can more
// thoroughly be done for CoffeeScript specifically via
// `CoffeeScript.register()`, but for purposes of this example this is the
// simplest method.
const require = createRequire(import.meta.url);
['.coffee', '.litcoffee', '.coffee.md'].forEach(extension => {
  require.extensions[extension] = (module, filename) => {
    const source = readFileSync(filename, 'utf8');
    return CoffeeScript.compile(source, { bare: true, filename });
  }
})
