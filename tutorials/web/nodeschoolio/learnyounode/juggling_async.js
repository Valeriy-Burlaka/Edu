var http = require('http')


var results = {}
var urls = process.argv.slice(2)
var pending = urls.length

urls.forEach((url) => {
	http.get(url, (resp) => {
		var fullData = "";
		resp.setEncoding('utf-8');
		resp.on('error', console.error);
		resp.on('data', (chunk) => {
			if (chunk) fullData += chunk
		});
		resp.on('end', () => {
			results[url] = fullData;
			pending -= 1;
			if (pending == 0) {
				urls.forEach((u) => console.log(results[u]));
			}
		});
	});
});
