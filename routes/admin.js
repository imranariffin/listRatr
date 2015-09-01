var express = require('express');
var router = express.Router();

// configure db 
var mongoose = require('mongoose');
var ListRatr = require('../schemas/listratr');
var List = require('../schemas/list');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'admin' });
});

/* GET all ratrs. */
router.get('/ratrs', function (req, res, next) {

	ListRatr.find({}, function (err, ratrs) {
		if (err) {
			res.send(err);
		} else {

			var nRatrs = ratrs.length;

			ratrList = [];

			console.log('looping through ratrs as obtained from .find():');
			for (i in ratrs) {
				console.log(i);
				console.log(ratrs[i]);
				console.log('typeof:');
				console.log(typeof(ratrs[i]));
				ratrList.push(ratrs[i]);
			}
			console.log('');

			console.log(ratrList);

			res.send(ratrs);
			// res.render('ratrs', { 
			// 	title: 'admin - ratrs',
			// 	ratrs : ratrs,
			// 	ratrList : ratrList,
			// 	typeofRatrs : typeof(ratrs),
			// 	nRatrs : nRatrs
			// });
		}
	});
});

/* GET all lists*/
router.get('/lists', function (req, res, next) {
	List.find({}, function (err, lists) {
		if (err) 
			res.send(err);
		else {
			res.send(lists);
			// rendaaaahh!
			// res.render('lists', {
			// 	title : 'Lystr Admin - All Lists',
			// 	lists : lists,

			// 	// show additinal data to admin
			// 	isAdmin : true,

			// 	partials : {
			// 		header : 'header',
			// 		footer : 'footer',
			// 		listsContainer : 'lists-container'
			// 	}
			// });
		}
	});
});


/* POST signup form. */
router.post('/signup', function (req, res, next) {
	// get form data
	var email = req.body.email;
	var password = req.body.password;
	var confirmPassword = req.body.confirmPassword;

	ListRatr.findOne({email : email}, function (err, ratr) {
		if (err) {
			res.send(err);
		} else {
			if (ratr) {
				res.send('bad: email not available');
			} else {
				console.log('good: email available');

				// create new listratr
				var listratr = new ListRatr ({
					email : email,
					password : password,
				});
				// and save it to db
				listratr.save();

				// save session
				req.session.listratr = listratr;

				res.send(listratr);
			}
		}
	});
});

router.get('/back-to-sq-1', function (req, res, next) {

	List.find({}, function (err, lists) {
		if (err) 
			send(err);
		else if (!lists) {
			res.send('no list available');
		} else {
			for (i in lists) {
				var list = lists[i];
				list.likes = 0;
				list.comments = [];
				list.nComments = 0;
				console.log('list.likes');
				console.log(list.likes);
				console.log('list.comments');
				console.log(list.comments);
				console.log('list.nComments');
				console.log(list.nComments);
				for (j in list.items) {
					var listItem = list.items;
					lists[i].items[j].score = 0;
					lists[i].items[j].comments = [];
					console.log('listItem.score');
					console.log(lists[i].items[j].score);
					console.log('lists[i].items[j].comments');
					console.log(lists[i].items[j].comments);
				}
				list.save(function (err) {
					if (err)
						res.send(err);
					else
						next();
				});
			}
		}
	});

}, function (req, res, next) {

	ListRatr.find({}, function (err, ratrs) {
		if (err) {
			res.send(err);
		} else if (!ratrs) {
			res.send('no ratr available');
		} else {
			for (i in ratrs) {
				var ratr = ratrs[i];
				ratr.nComments = 0;
				ratr.likes = [];
				ratr.votes.up = [];
				ratr.votes.down = [];
				ratr.comments = [];
				ratr.save(function (err) {
					if (err)
						res.send(err);
					else
						next();
				});
			}
		}
	});
	
}, function (req, res, next) {
	res.send('done resetting');
});

	// _resetLystr, _resetLysterer);

function _resetLystr (req, res, next) {
	// reset all lystrs and lystrers to factory state 
	List.find({}, resetLystr);
}

module.exports = router;

function _resetLysterer (req, res, next) {
	res.send('done resetting');
}

	// // basic information
	// id : ObjectId,
	// title : String,
	// dateCreated: Date,
	// owner : String,
	// url : String,
	// items : [{
	// 	header : String,
	// 	content : String,
	// 	score : {
	// 		type : Number,
	// 		default : 0
	// 	},
	// 	comments : [{
	// 		text : String,
	// 		commenter : ObjectId,
	// 		date : Date
	// 	}]
	// }],
	// likes : {
	// 	type : Number,
	// 	default : 0
	// },
	// comments : [{
	// 	text : String,
	// 	commenter : String,
	// 	date : Date
	// }],
	// nComments : {type : Number, default : 0}