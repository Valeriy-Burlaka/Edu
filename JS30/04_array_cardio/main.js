

const inventors = [
    {first: 'Albert', last: 'Enstein', year: 1879, passed: 1955},
    {first: 'Isaac', last: 'Newton', year: 1643, passed: 1727},
    {first: 'Galileo', last: 'Galilei', year: 1564, passed: 1642},
    {first: 'Marie', last: 'Curie', year: 1867, passed: 1934},
    {first: 'Johannes', last: 'Kepler', year: 1571, passed: 1630},
    {first: 'Nicolaus', last: 'Copernicus', year: 1473, passed: 1543},
    {first: 'Max', last: 'Planck', year: 1858, passed: 1947}
];

const people = ['Beck, Glenn', 'Becker, Carl', 'Beckett, Samuel', 'Beddoes, Mick',
'Beecher, Henry', 'Beethoven, Ludwig', 'Begin, Menachem', 'Belloc, Hilaire',
'Bellow, Saul', 'Benchley, Robert', 'Benenson, Peter', 'Ben-Gurion, David',
'Benjamin, Walter', 'Benn, Tony', 'Bennigton, Chester', 'Benson, Leana', 
'Bent, Silas', 'Bensten, Lloyd', 'Berger, Ric', 'Bergman, Ingmar', 'Berio, Luciano',
'Berle, Wilton', 'Berlin, Irving', 'Berne, Eric', 'Bernhard, Sandra', 'Berra, Yogi',
'Berry, Halle', 'Berry, Wendell', 'Bethea, Erin', 'Bevan, Aneurin', 'Bevel, Ken',
'Biden, Joseph', 'Bierce, Ambrose', 'Biko, Steve', 'Billings, Josh', 'Blondo, Frank',
'Birrell, Augustine', 'Black, Elk', 'Blair, Robert', 'Blair, Tony',
'Blake, William'];

let result;

// 1. Filter the list of inventors for those who were born in the 1500s
result = inventors.filter( inv => {
    let born = inv.year;
    return (born >= 1500 && born < 1600);
});

// 2. Give us an array of the inventor first and last names
result = inventors.map( inv => {
    return `${inv.first} ${inv.last}`;
});

// 3. Sort the inventors by birthdate, oldest to youngest
result = inventors.sort( (a, b) => {
    return a.year - b.year;
});

// 4. How many years did all the inventors live?
result = inventors.reduce( (x, y) => {
    return x + (y.passed - y.year);
}, 0);

// 5. Sort the inventors by years lived
result = inventors.sort( (a, b) => {
    return (a.passed - a.year) - (b.passed - b.year);
});

// 6. Create a list of Boulevards in Paris that contain 'de' anywhere in the name
// https://en.wikipedia.org/wiki/Category:Boulevards_in_Paris
const boulevards = [
    'Boulevard Auguste-Blanqui', 'Boulevard Barbès', 'Boulevard Beaumarchais',
    'Boulevard de l\'Amiral-Bruix', 'Boulevard des Capucines', 'Boulevard de la Chapelle',
    'Boulevard de Clichy', 'Boulevard du Crime', 'Boulevard Haussmann',
    'Boulevard de l\'Hôpital', 'Boulevard des Italiens', 'Boulevard de la Madeleine',
    'Boulevard de Magenta', 'Boulevard Montmartre', 'Boulevard du Montparnasse',
    'Boulevard Raspail', 'Boulevard Richard-Lenoir', 'Boulevard de Rochechouart',
    'Boulevard Saint-Germain', 'Boulevard Saint-Michel', 'Boulevard de Sébastopol',
    'Boulevard de Strasbourg', 'Boulevard du Temple', 'Boulevard Voltaire',
    'Boulevard de la Zone'
];
result = boulevards.filter( b => {
    let re = /\s(de)\s/;
    return b.match(re) != null;
});

// 7. Sort the people alphabetically by last name
result = people.sort( (a, b) => {
    let nameA = a.split(",")[0];
    let nameB = b.split(",")[0];
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
});

// 8. Sum up the instances of each of these
const data = [
    'car', 'car', 'truck', 'truck', 'bike', 'walk', 'car', 'van', 'bike',
    'walk', 'car', 'van', 'car', 'truck'
]; 
result = data.reduce( (obj, item) => {
    if (obj[item]) {
        obj[item] += 1;
    } else {
        obj[item] = 1;
    }
    return obj;
}, {});
