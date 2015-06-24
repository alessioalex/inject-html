"use strict";

var debug = require('debug')('inject-html');
var assert = require('assert');
var interceptRes = require('response-spy');
var trumpet = require('trumpet');
var mime = require('mime-types');
var through2 = require('through2');
var overrideResponse = require('./lib/response-overrider');
var noop = function() {};

function injectHtml(opts) {
  assert(opts, 'missing options param');
  assert(opts.code, 'missing code param');

  opts.type = opts.type || 'prepend';

  return function injectCode(req, res, next) {
    var mimeType = mime.lookup(req.url);

    next = next || noop;

    if ((mimeType !== false) && (mimeType !== 'text/html')) {
      return next();
    }

    debug('potential HTML page: ' + req.url);

    var originalResFns = overrideResponse(res);
    var stream = interceptRes(res);

    stream.on('headers', function(headers, statusCode) {
      var isHtml = /text\/html/ig.test(headers['content-type']);
      delete headers['content-length'] && res.removeHeader('Content-Length');
      originalResFns.writeHead(statusCode, headers);

      if (isHtml) {
        debug('intercepted: ' + req.url);

        var tr = trumpet();

        tr.select('body', function(body) {
          var bodyStream = body.createStream();

          if (opts.type === 'prepend') {
            debug('prepend');

            bodyStream.write(opts.code);
            bodyStream.pipe(bodyStream);
          } else {
            debug('append');

            bodyStream.pipe(through2(
              function(chunk, enc, cb) { cb(null, chunk) }, // transform is a noop
              function(cb) { // flush function
                this.push(opts.code);
                cb();
              }
            )).pipe(bodyStream);
          }
        });

        stream.pipe(tr);

        tr.on('data', function(chunk) {
          originalResFns.write(chunk.toString('utf8'));
        });

        tr.on('end', originalResFns.end);
      } else {
        stream.on('data', originalResFns.write);
        stream.on('end', originalResFns.end);
      }
    });

    stream.on('error', function(err) {
      console.error('response-spy stream error');
      throw err;
    });

    next();
  };
}

module.exports = injectHtml;
