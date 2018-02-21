var fs = require('fs'),
	http = require('http');
var port = process.argv[2];
var fileName = process.argv[3];

var server = http.createServer((req, resp) => {
	// var text = '';
	// var stream = fs.createReadStream(fileName);
	// stream.setEncoding('utf8');
	// stream.on('data', (chunk) => {
	// 	resp.write(chunk);
	// })
	// stream.on('end', () => resp.end());
	fs.createReadStream(fileName).pipe(resp);

});
server.listen(port);