import request from 'supertest';
import Koa from 'koa';

import fs from 'node:fs';

import etag from '../src';

describe('etag()', () => {
  describe('when body is missing', () => {
    it('should not add ETag', async () => {
      const app = new Koa();

      app.use(etag());

      app.use((_, next) => next());

      await request(app.callback()).get('/');
    });
  });

  describe('when ETag is exists', () => {
    it('should not add ETag', async () => {
      const app = new Koa();

      app.use(etag());

      app.use((ctx, next) => {
        ctx.body = { hi: 'etag' };
        ctx.etag = 'etaghaha';
        return next();
      });

      const response = await request(app.callback()).get('/');

      expect(response.status).toBe(200);
      expect(response.headers.etag).toBe('"etaghaha"');
      expect(response.body.hi).toBe('etag');
    });
  });

  describe('when body is a string', () => {
    it('should add ETag', async () => {
      const app = new Koa();

      app.use(etag());

      app.use(async (ctx, next) => {
        await next();
        ctx.body = 'Hello World';
      });

      const response = await request(app.callback()).get('/');      
      expect(response.headers.etag).toBe('"b-Ck1VqNd45QIvq3AZd8XYQLvEhtA"');
    });
  });

  describe('when body is a Buffer', () => {
    it('should add ETag', async () => {
      const app = new Koa();

      app.use(etag());

      app.use(async (ctx, next) => {
        await next();

        ctx.body = Buffer.from('Hello World');
      });

      const response = await request(app.callback()).get('/');
      expect(response.headers.etag).toBe('"b-Ck1VqNd45QIvq3AZd8XYQLvEhtA"');
    });
  });

  describe('when body is JSON', () => {
    it('should add ETag', async () => {
      const app = new Koa();

      app.use(etag());

      app.use(async (ctx, next) => {
        await next();
        ctx.body = { foo: 'bar' };
      });

      const response = await request(app.callback()).get('/');

      expect(response.headers.etag).toBe('"d-pedE0BZFQNM7HX6mFsKPL6l+dUo"');
    });
  });

  describe('when body is a stream with a .path', () => {
    it('should add an ETag', async () => {
      const app = new Koa();

      app.use(etag());

      app.use(async (ctx, next) => {
        await next();
        ctx.body = fs.createReadStream('package.json');
      });

      const response = await request(app.callback()).get('/');
      expect(response.headers.etag).toMatch(/^W\/.+/);
    });
  });

  describe('when body is a Blob', () => {
    it('should add an ETag from its contents', async () => {
      const app = new Koa();

      app.use(etag());

      app.use(async (ctx, next) => {
        await next();
        ctx.body = new Blob(['Hello World']);
      });

      const response = await request(app.callback()).get('/');
      expect(response.headers.etag).toBe('"b-Ck1VqNd45QIvq3AZd8XYQLvEhtA"');
    });
  });

  describe('when body is a ReadableStream', () => {
    it('should not add ETag', async () => {
      const app = new Koa();

      app.use(etag());

      app.use(async (ctx, next) => {
        await next();
        ctx.body = new Blob(['Hello World']).stream();
      });

      const response = await request(app.callback()).get('/');
      expect(response.headers.etag).toBeUndefined();
    });
  });

  describe('when body is a Response', () => {
    it('should not add ETag', async () => {
      const app = new Koa();

      app.use(etag());

      app.use(async (ctx, next) => {
        await next();
        ctx.body = new Response('Hello World');
      });

      const response = await request(app.callback()).get('/');
      expect(response.headers.etag).toBeUndefined();
    });
  });

  describe('when the web body globals are missing', () => {
    it('should still add an ETag to JSON bodies', async () => {
      const {Blob, ReadableStream, Response} = globalThis;
      const app = new Koa();

      // Koa 2 on Node versions without these globals
      app.use(async (_, next) => {
        try {
          await next();
        } finally {
          Object.assign(globalThis, {Blob, ReadableStream, Response});
        }
      });

      app.use(etag());

      app.use(async (ctx, next) => {
        await next();
        ctx.body = {hi: 'etag'};
        // @ts-expect-error simulate missing globals
        delete globalThis.Blob;
        // @ts-expect-error simulate missing globals
        delete globalThis.ReadableStream;
        // @ts-expect-error simulate missing globals
        delete globalThis.Response;
      });

      const response = await request(app.callback()).get('/');
      expect(response.status).toBe(200);
      expect(response.headers.etag).toBe('"d-7khfMzXSVEAs7+UdfeUM4r8bO0Q"');
    });
  });

  describe('when with options', () => {
    it('should add weak ETag', async () => {
      const app = new Koa();
      const options = { weak: true };

      app.use(etag(options));

      app.use(async (ctx, next) => {
        await next();
        ctx.body = 'Hello World';
      });

      const response = await request(app.callback()).get('/');
      expect(response.headers.etag).toBe(
        'W/"b-Ck1VqNd45QIvq3AZd8XYQLvEhtA"'
      );
    });
  });
});
