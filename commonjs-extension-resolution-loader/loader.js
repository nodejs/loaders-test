import { existsSync } from 'fs';
import { createRequire } from 'module';
import { dirname } from 'path';
import { URL, fileURLToPath, pathToFileURL } from 'url';

const require = createRequire(import.meta.url);
const baseURL = pathToFileURL(process.cwd() + '/').href;

export function resolve(specifier, context, defaultResolve) {
  const { parentURL = baseURL } = context;

  // `require.resolve` works with paths, not URLs, so convert to and from
  if (specifier.startsWith('file://')) {
    specifier = fileURLToPath(specifier);
  }
  const basePath = dirname(fileURLToPath(parentURL));
  const resolvedPath = require.resolve(specifier, {paths: [basePath]});

  if (existsSync(resolvedPath)) {
    return {
      url: pathToFileURL(resolvedPath).href
    };
  }

  // Let Node.js handle all other specifiers, such as package names
  return defaultResolve(specifier, context, defaultResolve);
}
