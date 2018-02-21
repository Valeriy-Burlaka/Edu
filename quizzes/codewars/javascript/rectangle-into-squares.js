function lngAndWdth(value1, value2) {
  let lng = Math.max(value1, value2);
  let wdth = Math.min(value1, value2);
  return [lng, wdth];
};

function sqInRect(lng, wdth) {
  let result = null;
  if (lng != wdth) {
    result = [];
    let trueLngAndWdth = lngAndWdth(lng, wdth);
    lng = trueLngAndWdth[0], wdth = trueLngAndWdth[1];
    while (lng && wdth) {
      result.push(wdth);
      lng -= wdth;
      let trueLngAndWdth = lngAndWdth(lng, wdth);
      lng = trueLngAndWdth[0], wdth = trueLngAndWdth[1];
    }
  }
  return result;
};

console.log(sqInRect(5, 5));
console.log(sqInRect(5, 3));
console.log(sqInRect(3, 5));
console.log(sqInRect(20, 14));
console.log(sqInRect(6, 3));
console.log(sqInRect(3, 6));
console.log(sqInRect(1, 2));
