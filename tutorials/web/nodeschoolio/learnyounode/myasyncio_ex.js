var fs = require('fs')

function add(number) {
	fs.readFile('./number.txt', 'utf-8', (err, fileContent) => {
		if (err) throw err;
		return console.log(fileContent);
	})
}

add(2);