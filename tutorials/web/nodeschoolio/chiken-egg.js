function chicken() {
    egg();
}

function egg() {
    chicken();
}

console.log(chicken() + ' came first.');
