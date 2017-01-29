var fs = require('fs')

function numNewLines(content) {
	return content.split('\n').length - 1
}

function callback(err, fileContent) {
	if (err) throw err;
	console.log(numNewLines(fileContent));
}

fs.readFile(process.argv[2], 'utf-8', callback);