var http = require('http');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World');
}).listen(9080, '127.0.0.1');

console.log('Listening on http://127.0.0.1:9080');
