"use strict";

var fs = require('fs');
var http = require('http');
var injectCode = require('../');
var PORT = process.env.PORT || 1337;
var hyperquest = require('hyperquest');
var getPort = require('get-port');
var connected = require('connected');

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
        fs.createReadStream(__dirname + '/page.html').pipe(res);
      } else {
        res.statusCode = 404;
        res.end('Page Not Found\n');
      }
    });
  });

  connected(server, port, function(err) {
    if (err) { throw err; }

    console.log('\n--------------------');
    console.log('BEFORE\n--------------------\n');
    console.log(fs.readFileSync(__dirname + '/page.html', 'utf8'));

    console.log('\n--------------------');
    console.log('AFTER\n--------------------\n');

    var request = hyperquest('http://localhost:' + port);

    request.on('end', function() {
      server.close();
    });

    request.pipe(process.stdout);
  });
});

// Sample output:
/*
--------------------
BEFORE
--------------------

<!DOCTYPE HTML>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>inject html example</title>
</head>
<body>
  <h3>inject-html example</h3>
  <p>content</p>
</body>
</html>


--------------------
AFTER
--------------------

<!DOCTYPE HTML>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>inject html example</title>
</head>
<body><script>alert('injected!!')</script>
  <h3>inject-html example</h3>
  <p>content</p>
</body>
</html>
*/
