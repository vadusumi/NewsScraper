// Require mongoose
var mongoose = require('mongoose');
// Create Schema class
var Schema = mongoose.Schema;

// Create comment schema
var CommentSchema = new Schema({
  	// title is a required string
	title: {
		type:String,
		required: true
	},
	// text is a required string
	text: {
		type: String,
		required: true
	}
});

// Create the Comment model with the CommentSchema
var Comment = mongoose.model("Comment", CommentSchema);

// Export the model
module.exports = Comment;