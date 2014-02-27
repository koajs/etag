
/**
 * Module dependencies.
 */

var crc = require('buffer-crc32').signed;
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

function etag() {
  return function *(next){
    yield next;

    // no body
    var body = this.body;
    if (!body || this.response.get('ETag')) return;

    // type
    var status = this.status / 100 | 0;
    var type = typeof body;
    var etag;

    // 2xx
    if (2 != status) return;

    // hash
    if (body instanceof Stream) {
      if (!body.path) return;
      var s = yield stat(body.path);
      etag = crc(s.size + '.' + s.mtime);
    } else if ('string' == type || Buffer.isBuffer(body)) {
      etag = crc(body);
    } else {
      etag = crc(JSON.stringify(body));
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
    fs.stat(file, done);
  }
}
