
var serve = require('koa-static');
var etag = require('./');
var koa = require('koa');
var app = koa();

// $ GET /package.json

app.use(etag());
app.use(serve('.'));

app.listen(3000);

console.log('listening on port 3000');