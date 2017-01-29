var express = require('express')
var bodyParser = require('body-parser')
var app = express()

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static("public"))
app.set("view engine", "ejs")


app.get("/", (req, res) => {
	// var cursor = db.collection("quotes").find()
	db.collection("quotes").find().toArray((err, result) => {
		if (err) return console.log(err)
		res.render("index.ejs", {quotes: result})
	})

})

app.post("/quotes", (req, res) => {
	db.collection("quotes").save(req.body, (err, db_res) => {
		if (err) return console.log(err)
		console.log(`Saved ${JSON.stringify(req.body)} to the database`)
		res.redirect("/")
	})

})

app.put("/quotes", (req, res) => {
	db.collection("quotes").findOneAndUpdate(
		{name: "Yoda"}, 
		{
			$set: {
				name: req.body.name,
				quote: req.body.quote
			}
		},
		{
			sort: {_id: -1},
			upsert: true
		},
		(err, result) => {
			if (err)  return res.send(err)
			res.send(result)
		}
	)
})

app.delete("/quotes", (req, res) => {
	// Handle delete
})


const MongoClient = require("mongodb").MongoClient
MongoClient.connect("mongodb://chebutroll:trollstest@ds157248.mlab.com:57248/learnjs", (err, database) => {
	if (err) return console.log(err)
	db = database
	var port = 3000
	app.listen(port, function() {
		console.log(`Example app is listening the port ${port}.`)
	})
})
