function plus(a, b) {
	return a + b
}

var result = process.argv.slice(2).map(Number).reduce(plus)

console.log(result)