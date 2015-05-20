# babel-concat
Use to concat JS files after babel transformation.

Installation
============

`npm install babel-concat`

```js
var concat = require("babel-concat")
```

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
