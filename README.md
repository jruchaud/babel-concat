# babel-concat
Use to concat JS files after babel transformation.

The apis (see API) take a list of files (or blocks of code) instead of a single one and process all the list to return a babel-like object ({code:..., map:...}):
- code attribute contains the concatenation of all compiled code blocks.
- map attribute contains a source map object which is the concatenation of each source-map of each given file (or block of code). This is only available if you activated the source-map option.


Installation
============

`npm install babel-concat`

```js
var concat = require("babel-concat")
```

API
===

### `transform(codeBlocks, options)` ###

Same as transform from babel except that you give a list of code blocks.

- `codeBlocks` : list of code blocks
- `options`: see babel options

### `transformFile(files, options, callback)` ###

Same as transformFile from babel with mutilple files.

- `files` : all files to transform
- `options`: see babel options
- `callback`: see babel callback

### `transformFileSync(files, options)` ###

Same as transformFileSync from babel with mutilple files.

- `files` : all files to transform
- `options`: see babel options

### `babelConcat(results, options)` ###

Concat all result with code and map from babel transform.

- `results` : all results from babel. Use option "both" or "true" to have the source map.
- `options`: see babel options


License
=======

[MIT License](LICENSE).
