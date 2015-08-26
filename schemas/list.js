// listr=listratr=user
// schema

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var List = mongoose.model('List', new Schema ({
	// basic information
	id : ObjectId,
	title : String,
	dateCreated: Date,
	owner : String,

	//* MAIN INFORMATION *//

	// unique url based on list title,
	// title, however, does not have to be unique
	url : String,
	// array of items
	items : [{
		header : String,
		content : String,
		score : {
			type : Number,
			default : 0
		}
	}],
	// array of listId the listr likes
	score : {
		type : Number,
		default : 0
	},
	// // list listr has voted
	// votes : {
	// 	type : Number,
	// 	default : 0
	// },
	// array of comments
	comments : [{
		text : String,
		commenter : String,
		data : Date
	}]
}));

module.exports = List;