import { builtinModules } from 'node:module';
import { dirname } from 'path';
import { cwd } from 'process';
import { fileURLToPath, pathToFileURL } from 'url';
import { promisify } from 'util';

import resolveCallback from 'resolve/async.js';

const resolveAsync = promisify(resolveCallback);

const baseURL = pathToFileURL(cwd() + '/').href;


export async function resolve(specifier, context, next) {
  const { parentURL = baseURL } = context;

  if (specifier.startsWith('node:') || builtinModules.includes(specifier)) {
    return next(specifier, context);
  }

  // `resolveAsync` works with paths, not URLs
  if (specifier.startsWith('file://')) {
    specifier = fileURLToPath(specifier);
  }
  const parentPath = fileURLToPath(parentURL);

  const resolution = await resolveAsync(specifier, {
    basedir: dirname(parentPath),
    extensions: ['.js', '.json', '.node'],
  });
  const url = pathToFileURL(resolution).href;

  return next(url, context);
}
