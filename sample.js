var http = require('http');
const PORT = 3000;

var server = http.createServer(handleRequest);

server.listen(PORT);
console.log('Listening on port '+PORT);

// Request handler: This gets called for each incoming HTTP request with
// a request object and a response object 
function handleRequest (req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Hello World\n'+'Verb: ' + req.method + '; URL: ' + req.url);
        console.log('Got a request: ' + req.method + '; URL: ' + req.url);
}

