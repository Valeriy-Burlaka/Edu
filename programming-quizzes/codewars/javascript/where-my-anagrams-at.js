// Where my anagrams at?

String.prototype.sort = function() {
  return this.split("").sort().join("");
};

function anagrams(word, words) {
  return words.filter( (w) => word.sort() == w.sort() );
};
