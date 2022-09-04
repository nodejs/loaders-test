export async function load(url, context, nextLoad) {
  if (!url.endsWith('.js')) return nextLoad(url);

  const nextResult = await nextLoad(url, { ...context, format: 'module' })
    .then((result) => {
      if (containsCJS(result.source)) { throw new Error('CommonJS'); }

      return result;
    })
    .catch(async (err) => {
      if (
        (err?.message.includes('require') && err.includes('import'))
        || err?.message.includes('CommonJS')
      ) {
        return { format: 'commonjs' };
      }

      throw err;
    });

  return nextResult;
}

function containsCJS(source) {
  const src = '' + source;

  // A realistic version of this loader would use a parser like Acorn to check for actual `module.exports` syntax
  if ((/exports[\[\.( ?=)]/).test(src)) { return true };

  if (
    (/require\(/).test(src)
    && !(/createRequire\(/).test(src)
  ) { return true; }
}
