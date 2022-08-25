export async function load(url, context, nextLoad) {
  if (!url.endsWith('.js')) return nextLoad(url);

  const nextResult = await nextLoad(url, { ...context, format: 'module' })
    .then((result) => {
      if (`${result.source}`.match(/exports[\. =]/)) throw new Error('Module is commonjs');

      return result;
    })
    .catch(async (err) => {
      if (
        (err?.message.includes('require') && err.includes('import'))
        || err?.message.includes('commonjs')
      ) return {
        format: 'commonjs',
        source: (await nextLoad(url, {...context, format: 'commonjs' })).source,
      };

      throw err;
    });

  return nextResult;
}
