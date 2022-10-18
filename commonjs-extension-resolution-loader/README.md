Node's ESM specifier resolution does not support all default behavior of
the CommonJS loader. One of the behavior differences is automatic resolution
of file extensions and the ability to import directories that have an index
file.

Use this loader to enable automatic extension resolution and importing from
directories that include an index file, like this:

```js
import file from './file'; // Where ./file is ./file.js or ./file.mjs
import index from './folder'; // Where ./folder is ./folder/index.js or ./folder/index.mjs
```

This loader also applies these automatic resolution rules to the program entry point passed to `node` on the command line:

```console
$ node index.mjs
success!
$ node index # Failure!
Error: Cannot find module
$ node --loader=./loader.js index
success!
```
