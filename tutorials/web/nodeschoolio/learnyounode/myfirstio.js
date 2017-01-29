var fs = require('fs')

var buf = fs.readFileSync(process.argv[2])
var content = buf.toString()

function numNewLines(string) {
	return string.split('\n').length -1 // splitting by delimiter produces an Array with a  (delimiter + 1) elements
}

function endsWith(string, char) {
	return string[string.length - 1] == char
}


console.log(numNewLines(content))

// Official version
// var fs = require('fs')  
// 
// var contents = fs.readFileSync(process.argv[2])  
// var lines = contents.toString().split('\n').length - 1  
// console.log(lines)  

// note you can avoid the .toString() by passing 'utf8' as the  
// second argument to readFileSync, then you'll get a String!  
//  
// fs.readFileSync(process.argv[2], 'utf8').split('\n').length - 1  