Node's ESM specifier resolution does not support all default behavior of
the CommonJS loader. One of the behavior differences is automatic resolution
of file extensions and the ability to import directories that have an index
file.

Use this loader to enable automatic extension resolution and importing from
directories that include an index file.

```console
$ node index.mjs
success!
$ node index # Failure!
Error: Cannot find module
$ node --loader=./loader.js index
success!
```
