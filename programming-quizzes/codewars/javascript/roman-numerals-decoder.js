function charCount(s, ch) {
  return (s.match(new RegExp(ch, "g")) || []).length;
}

function fromRoman(roman){
  roman = roman.replace(/CM/, "DCCCC").
    replace(/CD/, "CCCC").
    replace(/XC/, "LXXXX").
    replace(/XL/, "XXXX").
    replace(/IX/, "VIIII").
    replace(/IV/, "IIII");
  let result = charCount(roman, "M") * 1000 +
    charCount(roman, "D") * 500 +
    charCount(roman, "C") * 100 +
    charCount(roman, "L") * 50 +
    charCount(roman, "X") * 10 +
    charCount(roman, "V") * 5 +
    charCount(roman, "I");
  return result;
};

console.assert(fromRoman("XXI") === 21);
console.assert(fromRoman("XLIV") === 44);
console.assert(fromRoman("MCMXC") === 1990);
console.assert(fromRoman("MMVIII") === 2008);
console.assert(fromRoman("MDCLXVI") === 1666);
