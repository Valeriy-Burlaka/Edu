var fs = require('fs');
var path = require('path');


function filteredLs(dirName, filterExt) {
	fs.readdir(dirName, (err, files) => {
		files.forEach( (fileName) => {
			if (path.extname(fileName).replace('.', '') == filterExt) {
				console.log(fileName);
			}
		})
	});
}

var args = process.argv 
filteredLs(args[2], args[3]);