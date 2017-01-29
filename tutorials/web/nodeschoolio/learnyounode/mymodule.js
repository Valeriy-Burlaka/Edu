var fs = require('fs');
var path = require('path');


exports.printFiles = function(dirName, targetExt, callback) {
	fs.readdir(dirName, (err, data) => {
		if (err) {
			callback(err);
		}
		else {
			targetFiles = data.filter((fileName) => {
				return path.extname(fileName).replace('.', '') == targetExt.replace('.', '')
			});
			callback(null, targetFiles);
		}
	})
}