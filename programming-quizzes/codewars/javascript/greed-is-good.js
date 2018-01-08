// score a dice throw aaccording to these rules:
// Three 1's => 1000 points
//  Three 6's =>  600 points
//  Three 5's =>  500 points
//  Three 4's =>  400 points
//  Three 3's =>  300 points
//  Three 2's =>  200 points
//  One   1   =>  100 points
//  One   5   =>   50 point

Array.prototype.count = function(v) {
  let count = 0;
  this.forEach( (el) => {
    if (el === v) count += 1;
  });
  return count;
};

function score( dice ) {
  let result = 0;
  [1, 2, 3, 4, 5, 6].forEach( (die) => {
    let triplet = false;
    let dieCount = dice.count(die);
    if (dieCount >= 3) {
      triplet = true;
      result += die * 100 < 200 ? die * 1000 : die * 100;
    };
    if (die === 1) {
      result += triplet ? (dieCount - 3) * 100 : dieCount * 100;
    } else if (die === 5) {
      result += triplet ? (dieCount - 3) * 50 : dieCount * 50;
    };
   });
   return result;
};

console.assert(score([2, 3, 4, 6, 2]) == 0);
console.assert(score([4, 4, 4, 3, 3]) == 400);
console.assert(score([2, 4, 4, 5, 4]) == 450);
