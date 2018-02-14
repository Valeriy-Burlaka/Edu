
module.exports.randomPick = function (array) {
    let choice = Math.floor(Math.random() * array.length);
    return array[choice];
};

module.exports.average = function (array) {
    let sum = array.reduce( (x, y) => x + y );
    return sum / array.length;
};
