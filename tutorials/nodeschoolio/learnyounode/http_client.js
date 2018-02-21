var http = require('http')


function main(url) {
	http.get(url, (resp) => {
	  // consume response body
	  // res.resume();
	  resp.setEncoding('utf-8')
	  resp.on('error', (e) => {
	  	console.log(`Got error: ${e.message}`);
	  });
	  resp.on('data', (chunk) => {
	  	console.log(chunk);
	  	
	  });
	  // resp.on('end', () => {
	  // 	console.log('No more data in response.')
	  // })
	 }).on('error', (e) => {
	 	console.log(`Got error ${e}`);
	 });
}

main(process.argv[2])

// official solution:

// var http = require('http')  
       
//      http.get(process.argv[2], function (response) {  
//        response.setEncoding('utf8')  
//        response.on('data', console.log)  
//        response.on('error', console.error)  
//      })  
   
