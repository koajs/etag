
/**
 * Module dependencies.
 */

var calculate = require('etag');
var Stream = require('stream');
var fs = require('mz/fs');

/**
 * Expose `etag`.
 */

module.exports = etag;

/**
 * Add ETag header field.
 * @param {object} [options] see https://github.com/jshttp/etag#options
 * @param {boolean} [options.weak]
 * @return {Function}
 * @api public
 */

function etag(options) {
  return function etag(ctx, next) {
    return next()
      .then(() => getResponseEntity(ctx))
      .then(entity => setEtag(ctx, entity, options));
  };
}

function getResponseEntity(ctx, options) {
  // no body
  var body = ctx.body;
  if (!body || ctx.response.get('ETag')) return;

  // type
  var status = ctx.status / 100 | 0;

  // 2xx
  if (2 != status) return;

  if (body instanceof Stream) {
    if (!body.path) return;
    return fs.stat(body.path).catch(noop);
  } else if (('string' == typeof body) || Buffer.isBuffer(body)) {
    return body;
  } else {
    return JSON.stringify(body);
  }
}

function setEtag(ctx, entity, options) {
  if (!entity) return;

  ctx.response.etag = calculate(entity, options);
}

function noop() {}
