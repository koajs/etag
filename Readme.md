
# koa-etag

 ETag support for Koa responses.

## Installation

```js
$ npm install koa-etag
```

## Example

```js
var etag = require('koa-etag');
var koa = require('koa');
var app = koa();

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

## License

  MIT