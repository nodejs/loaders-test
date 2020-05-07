import { URL, pathToFileURL } from 'url';
import CoffeeScript from 'coffeescript';

const baseURL = pathToFileURL(process.cwd() + '/').href;

// CoffeeScript files end in .coffee, .litcoffee or .coffee.md.
const extensionsRegex = /\.coffee$|\.litcoffee$|\.coffee\.md$/;

export function resolve(specifier, context, defaultResolve) {
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

export function getFormat(url, context, defaultGetFormat) {
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
    const { format } = defaultGetFormat(`${url}.js`);
    console.log(url, format);
    return {format};
  }

  // Let Node.js handle all other URLs.
  return defaultGetFormat(url, context, defaultGetFormat);
}

export function transformSource(source, context, defaultTransformSource) {
  const { url, format } = context;

  // This hook converts CoffeeScript source code into JavaScript source code
  // for all imported CoffeeScript files.
  if (format === 'commonjs') {
    console.log(require.cache);
    return {
      source: ''
    }
  }
  if (extensionsRegex.test(url)) {
    return {
      source: CoffeeScript.compile(source, {bare: true})
    };
  }

  // Let Node.js handle all other sources.
  return defaultTransformSource(source, context, defaultTransformSource);
}
