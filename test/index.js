
var request = require('supertest');
var koa = require('koa');
var etag = require('..');
var fs = require('fs');

describe('etag()', function(){
  describe('when body is missing', function(){
    it('should not add ETag', function(done){
      var app = koa();

      app.use(etag());

      app.use(function *(next){
        yield next;
      });

      request(app.listen())
      .get('/')
      .end(done);
    })
  })

  describe('when ETag is exists', function(){
    it('should not add ETag', function(done){
      var app = koa();

      app.use(etag());

      app.use(function *(next){
        this.body = {hi: 'etag'};
        this.etag = 'etaghaha';
        yield next;
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
      var app = koa();

      app.use(etag());

      app.use(function *(next){
        yield next;
        this.body = 'Hello World';
      });

      request(app.listen())
      .get('/')
      .expect('ETag', '"b-Ck1VqNd45QIvq3AZd8XYQLvEhtA"')
      .end(done);
    })
  })

  describe('when body is a Buffer', function(){
    it('should add ETag', function(done){
      var app = koa();

      app.use(etag());

      app.use(function *(next){
        yield next;
        this.body = new Buffer('Hello World');
      });

      request(app.listen())
      .get('/')
      .expect('ETag', '"b-Ck1VqNd45QIvq3AZd8XYQLvEhtA"')
      .end(done);
    })
  })

  describe('when body is JSON', function(){
    it('should add ETag', function(done){
      var app = koa();

      app.use(etag());

      app.use(function *(next){
        yield next;
        this.body = { foo: 'bar' };
      });

      request(app.listen())
      .get('/')
      .expect('ETag', '"d-pedE0BZFQNM7HX6mFsKPL6l+dUo"')
      .end(done);
    })
  })

  describe('when body is a stream with a .path', function(){
    it('should add an ETag', function(done){
      var app = koa();

      app.use(etag());

      app.use(function *(next){
        yield next;
        this.body = fs.createReadStream('package.json');
      });

      request(app.listen())
      .get('/')
      .expect('ETag', /^W\/.+/)
      .end(done);
    })
  })

  describe('when with options', function(){
    it('should add weak ETag', function(done){
      var app = koa();
      var options = {weak: true};

      app.use(etag(options));

      app.use(function *(next){
        yield next;
        this.body = 'Hello World';
      });

      request(app.listen())
      .get('/')
      .expect('ETag', 'W/"b-Ck1VqNd45QIvq3AZd8XYQLvEhtA"')
      .end(done);
    })
  })
})
