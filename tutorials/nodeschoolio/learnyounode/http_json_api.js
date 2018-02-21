'use-strict';

var http = require('http'),
	urlparse = require('url');

var port = process.argv[2];


function transform(parsedUrl, timeType) {
	var payload = parsedUrl['query']['iso'];
	var date = new Date(payload);
	if (timeType == 'json') {
		var transformed = {'hour': date.getHours(), 
						'minute': date.getMinutes(), 
						'second': date.getSeconds()};
		transformed = JSON.stringify(transformed);
	} else if (timeType == 'unix') {
		var transformed = JSON.stringify({'unixtime': date.getTime()});
	} else {
		console.log(`Unsupported dateTime transformation ${timeType}`);
	};
	

	return transformed
};

function writeHead(resp) {
	resp.writeHead(200, {'content-type': 'application/json'});
}


var server = http.createServer((req, resp) => {
	if (req.method != 'GET') {
		return resp.end('Send me a GET request!\n')
	};

	var parsedUrl = urlparse.parse(req.url, true);
	if (parsedUrl['pathname'] == '/api/parsetime') {
		writeHead(resp);
		resp.end(transform(parsedUrl, 'json'));
	} else if (parsedUrl['pathname'] == '/api/unixtime') {
		writeHead(resp);
		resp.end(transform(parsedUrl, 'unix'));
	} else {
		return resp.end(`Unsupported API method ${req.url}\n`)
	};
})

server.listen(port);

// Official soultion:
// var http = require('http')  
// var url = require('url')  

// function parsetime (time) {  
// return {  
//  hour: time.getHours(),  
//  minute: time.getMinutes(),  
//  second: time.getSeconds()  
// }  
// }  

// function unixtime (time) {  
// return { unixtime : time.getTime() }  
// }  

// var server = http.createServer(function (req, res) {  
// var parsedUrl = url.parse(req.url, true)  
// var time = new Date(parsedUrl.query.iso)  
// var result  

// if (/^\/api\/parsetime/.test(req.url))  
//  result = parsetime(time)  
// else if (/^\/api\/unixtime/.test(req.url))  
//  result = unixtime(time)  

// if (result) {  
//  res.writeHead(200, { 'Content-Type': 'application/json' })  
//  res.end(JSON.stringify(result))  
// } else {  
//  res.writeHead(404)  
//  res.end()  
// }  
// })  
// server.listen(Number(process.argv[2]))  
