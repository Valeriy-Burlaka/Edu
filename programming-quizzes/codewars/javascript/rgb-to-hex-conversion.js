let mapping = {
  0: "0",
  1: "1",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  10: "A",
  11: "B",
  12: "C",
  13: "D",
  14: "E",
  15: "F"
};

function toHex(decimalNum) {
  if (decimalNum < 16) {
    return mapping[decimalNum];
  } else {
    return toHex(Math.floor(decimalNum / 16)) + toHex(decimalNum % 16);
  }
};

function rgb(r, g, b){
  return [r, g, b].map( (elem) => {
    elem = elem > 255 ? 255 : elem;
    elem = elem < 0 ? 0 : elem;
    let result =  toHex(elem);
    result = result.length == 2 ? result : "0" + result;
    return result
  }).join("");
};

// Using in-built Number.toString() method ( Number(num).toString(base) )

// function rgb(r, g, b){
//   return toHex(r)+toHex(g)+toHex(b);
// }
//
// function toHex(d) {
//     if(d < 0 ) {return "00";}
//     if(d > 255 ) {return "FF";}
//     return  ("0"+(Number(d).toString(16))).slice(-2).toUpperCase()
// }


console.assert(rgb(255, 255, 255) === "FFFFFF");
console.assert(rgb(255, 255, 300) === "FFFFFF");
console.assert(rgb(0,0,0) === "000000");
console.assert(rgb(1,1,1) === "010101");
console.assert(rgb(148, 0, 211) === "9400D3");
