
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var request = require("request"); 
var cheerio = require("cheerio");

var Article = require("./models/Article.js");

var app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));


mongoose.Promise = Promise;

mongoose.connect("mongodb://heroku_8jv6xt76:pnjro7m6a4j4pfhdnlbpoq9auf@ds115583.mlab.com:15583/heroku_8jv6xt76");
var db = mongoose.connection;

db.on("error", function(error){
	console.log("Error: ", error);
});

db.once("open", function(){
	console.log("Database connection established")
});



//Routes

//Index
app.get('/', function(req, res) {
  res.send(index.html);
});


//Scraper
app.get("/scrape", function(req, res) {

  request("http://www.theverge.com/", function(error, response, html) {
    
    var $ = cheerio.load(html);

    $("h2.c-entry-box--compact__title").each(function(i, element) {

      //Empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        
        if (err) {
          console.log(err);
        } else {
          console.log(doc);
        }
      });

    });
  });
  // Tell the browser that we finished scraping the text
  res.send("Scrape Complete");
});


//Get all articles
app.get("/articles", function(req, res){
	Article.find({}, function(err, doc){
		if (err) {
			console.log(err);
		} else {
			res.json(doc);
		}
	});
});


//Get one article by ID
app.get("/articles/:id", function(req, res){

	Article.findOne({"_id": req.params.id})
	.populate("comment")
	.exec(function(err, doc){
		if (err) {
			console.log(err);
		} else {
			res.json(doc);
		}
	});
});


// Create a new comment or replace an existing comment
app.post("/articles/:id", function(req, res) {
  // Create a new comment and pass the req.body to the entry
  var newComment = new Comment(req.body);

  // And save the new comment the db
  newComment.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's comment
      Article.findOneAndUpdate({ "_id": req.params.id }, { "comment": doc._id })
      // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          res.send(doc);
        }
      });
    }
  });
});