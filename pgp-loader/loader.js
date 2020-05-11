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
      url: specifier
    };
  } else if (parentURL && parentURL.endsWith('.pgp')) {
    return {
      url: new URL(specifier, parentURL).href
    };
  }

  // Let Node.js handle all other specifiers.
  return defaultResolve(specifier, context, defaultResolve);
}

export function getFormat(url, context, defaultGetFormat) {
  // This loader assumes all PGP files are JavaScript ES modules.
  if (url.endsWith('.pgp')) {
    return {
      format: 'module'
    };
  }

  // Let Node.js handle all other URLs.
  return defaultGetFormat(url, context, defaultGetFormat);
}

export function transformSource(source, context, defaultTransformSource) {
  if (context.url.endsWith('.pgp')) {
    return fs.readFile('private-key.asc', 'utf8')
    .then(privKey => pgp.key.readArmored(privKey))
    .then(priv => privateKeys = priv.keys)
    .then(() => privateKeys[0].decrypt(passwd))
    .then(() => pgp.message.readArmored(source))
    .then(cryptMsg => pgp.decrypt({
        message: cryptMsg,
        privateKeys: privateKeys
    }))
    .then(decripted => ({source: decripted.data}) )
  }

  // Let Node.js handle all other URLs.
  return defaultTransformSource(source, context, defaultTransformSource);
}
