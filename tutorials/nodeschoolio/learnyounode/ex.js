"use strict"

// var funcs = [];

// for (let i=0; i < 10; i++) {
//     funcs.push(function() { console.log(i); });
// }

// funcs.forEach(function(func) {
//     func();     // outputs the number "10" ten times
// });


var a = [];

a.bar = 'jey';
a[3] = 'd';
a[0] = 'a';
a.foo = 'f';

console.log('forEach loop:\n')

a.forEach(function(k, v) {
	console.log(k, v);
})

console.log('for in loop:\n')

for (let i in a) {
	console.log(i, a[i]);
}

console.log('for of loop: \n')
for (let v of a) {
	console.log(v)
}