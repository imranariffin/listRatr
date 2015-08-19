// listr=listratr=user
// schema

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ListRatr = mongoose.model('ListRatr', new Schema ({
	// basic information
	id : ObjectId,
	email : String,
	firstName : String,
	lastName : String,
	dateJoined : Date,
	// auth
	password : String,

	//* LIST INFORMATION *//
	
	// array of listId
	lists : [ObjectId],
	// array of listId the listratr likes
	likes : [ObjectId],
	// list listratr has voted
	votes : {
		// array of listId listratr has updvoted
		up : [ObjectId],
		// array of listId listratr has updvoted
		down : [ObjectId]
	}
}));

module.exports = ListRatr;