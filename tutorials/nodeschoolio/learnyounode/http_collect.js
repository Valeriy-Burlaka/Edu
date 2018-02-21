var http = require('http');


http.get(process.argv[2], (resp) => {
	resp.setEncoding('utf-8');
	var fullReponse = '';
	resp.on('data', (chunk) => {
		if (chunk) {
			fullReponse += chunk;
		}
	});
	resp.on('error', console.error);
	resp.on('end', () => {
		console.log(fullReponse.length);
		console.log(fullReponse);
	});
})

// official solution:

//    var http = require('http')  
//      var bl = require('bl')  
       
//      http.get(process.argv[2], function (response) {  
//        response.pipe(bl(function (err, data) {  
//          if (err)  
//            return console.error(err)  
//          data = data.toString()  
//          console.log(data.length)  
//          console.log(data)  
//        }))    
//      })  


// (https://github.com/rvagg/bl#new-bufferlist-callback--buffer--buffer-array-][2])