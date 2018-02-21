$("h1").on('click', function(e) {
	console.log(e);
	$(e.target).css('background', 'red');
})