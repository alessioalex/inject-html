"use strict";

var fs = require('fs');
var http = require('http');
var injectCode = require('../');
var PORT = process.env.PORT || 1337;
var hyperquest = require('hyperquest');
var getPort = require('get-port');
var connected = require('connected');

var test = require('tape');

test("prepend code", function(t) {
  var inject = injectCode({
    // type: 'append', // default 'prepend'
    code: "<script>alert('injected!!')</script>" // HTML code
  });

  // get an available port
  getPort(function(err, port) {
    if (err) { throw err; }

    var server = http.createServer(function(req, res) {
      inject(req, res, function() {
        res.setHeader('Content-Type', 'text/html');

        if (req.url === '/') {
          fs.createReadStream(__dirname + '/fixtures/page.html').pipe(res);
        } else {
          res.statusCode = 404;
          res.end('Page Not Found\n');
        }
      });
    });

    connected(server, port, function(err) {
      if (err) { throw err; }

      var buf = '';
      var request = hyperquest('http://localhost:' + port);

      request.on('data', function(chunk) { buf += chunk; });

      request.on('end', function() {
        server.close();
        t.equal(fs.readFileSync(__dirname + '/fixtures/page-injected-prepend.html', 'utf8'), buf);
        t.end();
      });
    });
  });
});


test("append code", function(t) {
  var inject = injectCode({
    type: 'append', // default 'prepend'
    code: "<script>alert('injected!!')</script>" // HTML code
  });

  // get an available port
  getPort(function(err, port) {
    if (err) { throw err; }

    var server = http.createServer(function(req, res) {
      inject(req, res, function() {
        res.setHeader('Content-Type', 'text/html');

        if (req.url === '/') {
          res.end(fs.readFileSync(__dirname + '/fixtures/page.html'));
        } else {
          res.statusCode = 404;
          res.end('Page Not Found\n');
        }
      });
    });

    connected(server, port, function(err) {
      if (err) { throw err; }

      var buf = '';
      var request = hyperquest('http://localhost:' + port);

      request.on('data', function(chunk) { buf += chunk; });

      request.on('end', function() {
        server.close();
        t.equal(fs.readFileSync(__dirname + '/fixtures/page-injected-append.html', 'utf8'), buf);
        t.end();
      });
    });
  });
});
