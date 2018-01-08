// Break CamelCase
// solution('camelCasing') // => should return 'camel Casing'

function solution(string) {
  let re = /[A-Z]/g;
  let result = [];
  let match;
  let start = 0;
  while ((match = re.exec(string)) != null) {
    let word = string.slice(start, match.index);
    start = match.index;
    result.push(word);
  };
  result.push(string.slice(start));

  return result.join(" ");
};


console.assert(solution("camelCasedString") == "camel Cased String");
console.assert(solution("camelCasedStringComeOn") == "camel Cased String Come On");

// Smarter:

// function solution(string) {
//   return(string.replace(/([A-Z])/g, ' $1'));
// };
