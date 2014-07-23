
# koa-etag

 ETag support for Koa responses.

## Installation

```js
$ npm install koa-etag
```

## Example

```js
var conditional = require('koa-conditional-get');
var etag = require('koa-etag');
var koa = require('koa');
var app = koa();

// etag works together with conditional-get
app.use(conditional());
app.use(etag());

app.use(function(next){
  return function *(){
    yield next;
    this.body = 'Hello World';
  }
})

app.listen(3000);

console.log('listening on port 3000');
```

## Options

### hash

By default, `etag` uses `crc32` to calculate bodies.
If you want to use a custom function,
set `options.hash`.
Custom etag calculation functions should accept both strings and buffers.

For example, to use hex-encoded `sha256` sums:

```js
var crypto = require('crypto');

app.use(etag({
  hash: function (body) {
    return crypto.createHash('sha256')
      .update(body)
      .digest('hex');
  }
}));
```

## License

  MIT
