
var etag = require('./');
var koa = require('koa');
var app = koa();

app.use(etag());

app.use(function(next){
  return function *(){
    yield next;
    //this.body = 'Hello World';
    //this.body = new Buffer('Hello World');
    this.body = { foo: 'bar' };
  }
})

app.listen(3000);

console.log('listening on port 3000');