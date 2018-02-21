var mymodule = require('./mymodule.js');


function printCallback (err, data) {
	if (err) {
		throw err
	}

	data.forEach((name) => {
		console.log(name);
	})
}

args = process.argv;

mymodule.printFiles(args[2], args[3], printCallback);