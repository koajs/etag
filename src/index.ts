'use strict';

/**
 * Module dependencies.
 */

import Stream from 'node:stream';
import {Buffer} from 'node:buffer';
import fs from 'node:fs/promises';
import calculate, {type Options as EtagOptions} from 'etag';
import type * as Koa from 'koa';

async function getResponseEntity(ctx: Koa.Context) {
  // no body
  const body = ctx.body;
  if (!body || ctx.response.get('etag')) return;

  // type
  const status = Math.trunc(ctx.status / 100);

  // 2xx
  if (status !== 2) return;

  if (body instanceof Stream) {
    if (!('path' in body) || typeof body.path !== 'string') return;
    return fs.stat(body.path);
  }

  if (typeof body === 'string' || Buffer.isBuffer(body)) return body;

  return JSON.stringify(body);
}

/**
 * Expose `etag`.
 *
 * Add ETag header field.
 * @param {object} [options] see https://github.com/jshttp/etag#options
 * @param {boolean} [options.weak]
 * @return {Function}
 * @api public
 */

export default function etag(options?: EtagOptions) {
  return async function (ctx: Koa.Context, next: Koa.Next) {
    await next();
    const entity = await getResponseEntity(ctx);
    if (!entity) return;
    ctx.response.etag = calculate(entity, options);
  };
}
