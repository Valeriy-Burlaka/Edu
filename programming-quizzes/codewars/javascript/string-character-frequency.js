Array.prototype.allSame = function() {
  for (let i = 1; i < this.length; i++) {
    if (this[i] !== this[0]) return false
  }
  return true;
};

function hasEqualCountOfEachChar(s) {
  let counts = {};
  for (let i = 0; i < s.length; i++) {
    let char = s[i];
    if (counts.hasOwnProperty(char)) counts[char] += 1;
    else counts[char] = 1;
  };
  return Object.values(counts).allSame();
};

String.prototype.remove = function(value) {
  let arr = this.split("");
  let index = this.indexOf(value);
  arr.splice(index, 1);
  return arr.join("");
};

function solve(s) {
  for (let i = 0; i < s.length; i++) {
    if (hasEqualCountOfEachChar(s.remove(s[i]))) return true;
  }
  return false;
};

console.assert(solve('aaaa') === true);
console.assert(solve('abba') === false);
console.assert(solve('abbba') === true);
console.assert(solve('aabbcc') === false);
console.assert(solve('aaaabb') === false);
console.assert(solve('aabbccddd') === true);
console.assert(solve('aabcde') === true);
console.assert(solve('abcde') === true);


// https://www.codewars.com/users/marie.hooper
//
// function allSame(arr) {
//   return arr.every(n => n === arr[0]);
// }
//
// function solve(s) {
//   const counts = {};
//   for (let char of s) {
//     counts[char] = (counts[char] || 0) + 1;
//   }
//
//   for (let letter in counts) {
//     counts[letter] -= 1;
//     const allCounts = Object.values(counts).filter(n => n !== 0);
//     if (allSame(allCounts)) {
//       return true;
//     }
//     counts[letter] += 1;
//   }
//   return false;
// }
