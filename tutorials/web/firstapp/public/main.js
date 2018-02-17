// main.js

var update = document.getElementById("update")
update.addEventListener("click", () => {
	fetch("quotes", {
		method: "put",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify({
			"name": "Darth Vadar",
			"quote": "I find your lack of faith disturbing!"
		})
	}).
	then(res => {
		if (res.ok) return res.josn()
	}).
	then(data => {
		console.log(data)
		window.location.reload(true)
	})
})

var del = document.getElementById("delete")
del.addEventListener("click", () => {
	fetch("quotes", {
		method: "delete",
		headers: {"content-type": "application/json"},
		body: JSON.stringify({"name": "Darth Vadar"})
	}).
	then(res => {
		if (res.ok) return res.json()
	}).
	then(data => {
		console.log(data)
		window.location.reload()
	})
})