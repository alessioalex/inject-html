# inject-html

Node module for injecting HTML code before or after the `body` tag into the response.

## usage

Installable via npm: `npm i inject-html`.

```js
var inject = injectCode({
  // type: 'append', // default 'prepend'
  code: "<script>alert('injected!!')</script>" // HTML code
});

http.createServer(function(req, res) {
  inject(req, res, function() {
    res.setHeader('Content-Type', 'text/html');

    if (req.url === '/') {
      fs.createReadStream(__dirname + '/page.html').pipe(res);
    } else {
      res.statusCode = 404;
      res.end('Page Not Found\n');
    }
  });
}).listen(1337);
```

Sample output:

before injecting:

```html
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
```

after injecting:

```html
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
```

## note

If the content doesn't have a `<body>` tag, this module __will not function properly__.

## license

[MIT](http://alessioalex.mit-license.org/)
