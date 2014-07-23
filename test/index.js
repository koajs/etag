
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
      .expect('ETag', '"1243066710"')
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
      .expect('ETag', '"1243066710"')
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
      .expect('ETag', '"-30673425"')
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
      .end(function(err, res){
        if (err) return done(err);
        res.should.have.header('ETag');
        done();
      });
    })
  })

  describe('when options.hash is set', function(){
    it('should add a custom ETag', function(done){
      var app = koa();

      app.use(etag({
        hash: function(){
          return 'lol';
        }
      }));

      app.use(function *(next) {
        yield *next;
        this.body = 'hello world';
      });

      request(app.listen())
      .get('/')
      .expect('ETag', '"lol"')
      .expect(200, done);
    })
  })
})
