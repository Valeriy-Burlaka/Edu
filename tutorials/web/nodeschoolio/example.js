var circle = {
	radius: 5
}

circle.area = function () {
	var radius = this.radius;
	return Math.PI * radius * radius
}

circle.circumference = function () {
	return 2 * Math.PI * this.radius
}

var circle2 = {
	radius: 10,
	area: circle.area,
	circumference: circle.circumference
};


console.log(circle.area());
console.log(circle2.area());