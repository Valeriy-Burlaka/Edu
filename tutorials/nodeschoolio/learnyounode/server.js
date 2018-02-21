var net = require('net');
var strftime = require('strftime');


function callback(socket) {
	date = strftime('%Y-%m-%d %H:%M', new Date());
	socket.end(`${date}\n`);

}

var server = net.createServer(callback);
server.listen(process.argv[2]);
