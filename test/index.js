
var request = require('supertest');
var Koa = require('koa');
var etag = require('..');
var fs = require('fs');

describe('etag()', function(){
  describe('when body is missing', function(){
    it('should not add ETag', function(done){
      var app = new Koa();

      app.use(etag());

      app.use(function (ctx, next){
        return next();
      });

      request(app.listen())
      .get('/')
      .end(done);
    })
  })

  describe('when ETag is exists', function(){
    it('should not add ETag', function(done){
      var app = new Koa();

      app.use(etag());

      app.use(function (ctx, next){
        ctx.body = {hi: 'etag'};
        ctx.etag = 'etaghaha';
        return next();
      });

      request(app.listen())
      .get('/')
      .expect('etag', '"etaghaha"')
      .expect({hi: 'etag'})
      .expect(200, done);
    })
  })

  describe('when body is a string', function(){
    it('should add ETag', function(done){
      var app = new Koa();

      app.use(etag());

      app.use(function (ctx, next){
        return next().then(function() {
          ctx.body = 'Hello World';
        });
      });

      request(app.listen())
      .get('/')
      .expect('ETag', '"b-Ck1VqNd45QIvq3AZd8XYQLvEhtA"')
      .end(done);
    })
  })

  describe('when body is a Buffer', function(){
    it('should add ETag', function(done){
      var app = new Koa();

      app.use(etag());

      app.use(function (ctx, next){
        return next().then(function() {
          ctx.body = new Buffer('Hello World');
        });
      });

      request(app.listen())
      .get('/')
      .expect('ETag', '"b-Ck1VqNd45QIvq3AZd8XYQLvEhtA"')
      .end(done);
    })
  })

  describe('when body is JSON', function(){
    it('should add ETag', function(done){
      var app = new Koa();

      app.use(etag());

      app.use(function (ctx, next){
        return next().then(function() {
          ctx.body = { foo: 'bar' };
        });
      });

      request(app.listen())
      .get('/')
      .expect('ETag', '"d-pedE0BZFQNM7HX6mFsKPL6l+dUo"')
      .end(done);
    })
  })

  describe('when body is a stream with a .path', function(){
    it('should add an ETag', function(done){
      var app = new Koa();

      app.use(etag());

      app.use(function (ctx, next){
        return next().then(function() {
          ctx.body = fs.createReadStream('package.json');
        });
      });

      request(app.listen())
      .get('/')
      .expect('ETag', /^W\/.+/)
      .end(done);
    })
  })

  describe('when with options', function(){
    it('should add weak ETag', function(done){
      var app = new Koa();
      var options = {weak: true};

      app.use(etag(options));

      app.use(function (ctx, next){
        return next().then(function() {
          ctx.body = 'Hello World';
        });
      });

      request(app.listen())
      .get('/')
      .expect('ETag', 'W/"b-Ck1VqNd45QIvq3AZd8XYQLvEhtA"')
      .end(done);
    })
  })
})
