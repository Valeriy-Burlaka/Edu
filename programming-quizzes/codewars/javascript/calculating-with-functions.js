// This time we want to write calculations using functions and get the results. Let's have a look at some examples:
//
// seven(times(five())); // must return 35
// four(plus(nine())); // must return 13
// eight(minus(three())); // must return 5
// six(dividedBy(two())); // must return 3
// Requirements:
//
// There must be a function for each number from 0 ("zero") to 9 ("nine")
// There must be a function for each of the following mathematical operations: plus, minus, times, dividedBy (divided_by in Ruby)
// Each calculation consist of exactly one operation and two numbers
// The most outer function represents the left operand, the most inner function represents the right operand

function valueOrChain(value, caller, ...args) {
  if (args.length == 0) return value;
  else return args[0][0](caller(), args[0][1]);
  return value;
};

function zero(...args) {
  return valueOrChain(0, zero, ...args)
};
function one(...args) {
  return valueOrChain(1, one, ...args)
};
function two(...args) {
  return valueOrChain(2, two, ...args)
};
function three(...args) {
  return valueOrChain(3, three, ...args)
};
function four(...args) {
  return valueOrChain(4, four, ...args)
};
function five(...args) {
  return valueOrChain(5, five, ...args)
};
function six(...args) {
  return valueOrChain(6, six, ...args)
};
function seven(...args) {
  return valueOrChain(7, seven, ...args)
};
function eight(...args) {
  return valueOrChain(8, eight, ...args)
};
function nine(...args) {
  return valueOrChain(9, nine, ...args)
};


// function one(...args) {
//   let value;
//   if (args.length == 0) value = 1;
//   else value = args[0][0](one(), args[0][1]);
//   return value;
// };


function plus(...args) {
  if (args.length > 1)
    return args[0] + args[1];
  else
    return [plus, args[0]];
};
function minus(...args) {
  if (args.length > 1)
    return args[0] - args[1];
  else
    return [minus, args[0]];
};
function times(...args) {
  if (args.length > 1)
    return args[0] * args[1];
  else
    return [times, args[0]];
};
function dividedBy(...args) {
  if (args.length > 1)
    return args[0] / args[1];
  else
    return [dividedBy, args[0]];
};

function Test() {};

Test.prototype.assertEquals = function(...args) {
  console.assert(args[0] == args[1]);
};
let test = new Test();
// test.assertEquals(2, 3);

test.assertEquals(one(plus(two())), 3);
test.assertEquals(one(minus(two())), -1);
test.assertEquals(one(times(two())), 2);
test.assertEquals(one(dividedBy(two())), 0.5);

test.assertEquals(one(plus(nine())), 10);


// smarter:
//
// 
// var n = function(digit) {
//   return function(op) {
//     return op ? op(digit) : digit;
//   }
// };
// var zero = n(0);
// var one = n(1);
// var two = n(2);
// var three = n(3);
// var four = n(4);
// var five = n(5);
// var six = n(6);
// var seven = n(7);
// var eight = n(8);
// var nine = n(9);
//
// function plus(r) { return function(l) { return l + r; }; }
// function minus(r) { return function(l) { return l - r; }; }
// function times(r) { return function(l) { return l * r; }; }
// function dividedBy(r) { return function(l) { return l / r; }; }
