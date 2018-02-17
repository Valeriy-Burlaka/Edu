// https://www.codewars.com/kata/52de553ebb55d1fca3000371/train/javascript
//
// You are provided with consecutive elements of an Arithmetic Progression.
// There is however one hitch: exactly one term from the original series is
// missing from the set of numbers which have been given to you.
// The rest of the given series is the same as the original AP. Find the missing term.
//
// You have to write the function findMissing(list), list will always be at
// least 3 numbers. The missing term will never be the first or last one.

function findMissing(list) {
  let pStep = (list[list.length-1] - list[0]) / list.length;
  let x0 = list[0];
  for (let y = 1; y <= list.length; y++) {
    xY = x0 + (pStep * y);
    if (list.indexOf(xY) < 0) {
      return xY;
    };
  };
};

console.assert(findMissing([1, 3, 4]) == 2);
console.assert(findMissing([-2, -7, -17]) == -12);
console.assert(findMissing([1, 1.5, 2.0, 3.0, 3.5, 4.0, 4.5, 5]) == 2.5);
console.assert(findMissing([-3, 2, 7, 12, 17, 27]) == 22);
