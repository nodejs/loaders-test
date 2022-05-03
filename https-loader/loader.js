import { get } from 'https';

export function resolve(specifier, context, nextResolve) {
  const { parentURL = null } = context;

  // Normally Node.js would error on specifiers starting with 'https://', so
  // this hook intercepts them and converts them into absolute URLs to be
  // passed along to the later hooks below.
  if (specifier.startsWith('https://')) {
    return {
      shortCircuit: true,
      url: specifier
    };
  } else if (parentURL && parentURL.startsWith('https://')) {
    return {
      shortCircuit: true,
      url: new URL(specifier, parentURL).href
    };
  }

  // Let Node.js handle all other specifiers.
  return nextResolve(specifier, context);
}

export function load(url, context, nextLoad) {
  // For JavaScript to be loaded over the network, we need to fetch and
  // return it.
  if (url.startsWith('https://')) {
    return new Promise((resolve, reject) => {
      get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({
          // This example assumes all network-provided JavaScript is ES module
          // code.
          format: 'module',
          shortCircuit: true,
          source: data,
        }));
      }).on('error', err => reject(err));
    });
  }

  // Let Node.js handle all other URLs.
  return nextLoad(url, context);
}
