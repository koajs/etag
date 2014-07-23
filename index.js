
/**
 * Module dependencies.
 */

var Stream = require('stream');
var fs = require('fs');

/**
 * Expose `etag`.
 */

module.exports = etag;

/**
 * Add ETag header field.
 *
 * @return {Function}
 * @api public
 */

function etag(options) {
  options = options || {};

  var calculate = options.hash
    || options.calculate
    || require('buffer-crc32').signed;

  return function *etag(next){
    yield* next;

    // no body
    var body = this.body;
    if (!body || this.response.get('ETag')) return;

    // type
    var status = this.status / 100 | 0;

    // 2xx
    if (2 != status) return;

    // hash
    var etag;
    if (body instanceof Stream) {
      if (!body.path) return;
      var s = yield stat(body.path);
      if (!s) return;
      etag = calculate(s.size + '.' + s.mtime);
    } else if (('string' == typeof body) || Buffer.isBuffer(body)) {
      etag = calculate(body);
    } else {
      etag = calculate(JSON.stringify(body));
    }

    // add etag
    if (etag) this.set('ETag', '"' + etag + '"');
  }
}

/**
 * Stat thunk.
 */

function stat(file) {
  return function(done){
    fs.stat(file, function(err, s) {
      done(null, s);
    });
  }
}
