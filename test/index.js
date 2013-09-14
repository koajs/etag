
var request = require('supertest');
var koa = require('koa');
var etag = require('..');
var fs = require('fs');

describe('etag()', function(){
  describe('when body is missing', function(){
    it('should not add ETag', function(done){
      var app = koa();

      app.use(etag());

      app.use(function(next){
        return function *(){
          yield next;
        }
      });

      request(app.listen())
      .get('/')
      .end(done);
    })
  })

  describe('when body is a string', function(){
    it('should add ETag', function(done){
      var app = koa();

      app.use(etag());

      app.use(function(next){
        return function *(){
          yield next;
          this.body = 'Hello World';
        }
      });

      request(app.listen())
      .get('/')
      .expect('ETag', '"581120842"')
      .end(done);
    })
  })

  describe('when body is a Buffer', function(){
    it('should add ETag', function(done){
      var app = koa();

      app.use(etag());

      app.use(function(next){
        return function *(){
          yield next;
          this.body = new Buffer('Hello World');
        }
      });

      request(app.listen())
      .get('/')
      .expect('ETag', '"1236951804"')
      .end(done);
    })
  })

  describe('when body is JSON', function(){
    it('should add ETag', function(done){
      var app = koa();

      app.use(etag());

      app.use(function(next){
        return function *(){
          yield next;
          this.body = JSON.stringify({ foo: 'bar' });
        }
      });

      request(app.listen())
      .get('/')
      .expect('ETag', '"2114749371"')
      .end(done);
    })
  })

  describe('when body is a stream', function(){
    it('should not add ETag', function(done){
      var app = koa();

      app.use(etag());

      app.use(function(next){
        return function *(){
          yield next;
          this.body = fs.createReadStream('package.json');
        }
      });

      request(app.listen())
      .get('/')
      .end(function(err, res){
        if (err) return done(err);
        res.header.should.not.have.property('ETag');
        done();
      });
    })
  })
})