import pgp from 'openpgp';
import { promises as fs } from 'fs';

const passwd = process.env.npm_package_config_key_passwd;
var privateKeys;

export function resolve(specifier, context, defaultResolve) {
  const { parentURL = null } = context;

  if (specifier.endsWith('.pgp')) {
    if (!/^[a-z0-9]+:/i.test(specifier)) {
      specifier = new URL(specifier, import.meta.url).href
    }
    return {
      shortCircuit: true,
      url: specifier,
    };
  } else if (parentURL && parentURL.endsWith('.pgp')) {
    return {
      shortCircuit: true,
      url: new URL(specifier, parentURL).href,
    };
  }

  // Let Node.js handle all other specifiers.
  return defaultResolve(specifier, context, defaultResolve);
}

export async function load(url, context, defaultLoad) {
  if (url.endsWith('.pgp')) {
    const { source } = await defaultLoad(url, { format: "module" })

    return fs.readFile('private-key.asc', 'utf8')
      .then(privKey => pgp.key.readArmored(privKey))
      .then(priv => privateKeys = priv.keys)
      .then(() => privateKeys[0].decrypt(passwd))
      .then(() => pgp.message.readArmored(source))
      .then(cryptMsg => pgp.decrypt({
        message: cryptMsg,
        privateKeys: privateKeys
      }))
      .then(decrypted => ({
        shortCircuit: true,
        format: "module",
        source: decrypted.data
      }))
  }

  // Let Node.js handle all other URLs.
  return defaultLoad(url, context, defaultLoad);
}
