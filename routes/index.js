var express = require('express');
var router = express.Router();

// configure db 
var mongoose = require('mongoose');
var ListRatr = require('../schemas/listratr');
var List = require('../schemas/list');
var ObjectId = mongoose.Schema.ObjectId;

/* GET home page. */
router.get('/', homeGET);

/* GET signup page. */
router.get('/signup', signupGET);

/* POST signup form. */
router.post('/signup', signupPOST);

/* GET signin page. */
router.get('/signin', signinGET);

/* POST signup form. */
router.post('/signin', signinPOST);

/* GET ratrs's profile page. */
router.get('/profile', profileGET);

/* GET ratr's top list. */
router.get('/lists', listsGET);

/* GET ratrs's create list page. */
router.get('/createList', CreateListGET);

/* POST ratrs creates a new list. */
router.post('/createList', createListPOST);

/* GET ratrs's list page. */
router.get('/mylists/:ratrId', ratrIdGET);

/* POST ratr likes a list */
router.post('/like', likePOST);

//////////////////////////////////////////////////
// 				ROUTE MIDDLEWARES 				//
//////////////////////////////////////////////////

function homeGET (req, res, next) {
	// get first list from db
	List.find({}, function (err, lists) {
		if (err) 
			res.send(err);
		else {
			// pseudo: in future top list should be list with highest rank/score
			// for now assume first list to be top list
			// topList = lists[0];
			// res.send(lists);

			console.log('\n\nlists before sort:\n');
			console.log(lists);
			console.log('\n\n');

			// rank now! (based on likes for now)
			lists = sortByLikes(lists);
			console.log('\n\nlists after sort:\n');
			console.log(lists);
			console.log('\n\n');

			// rendaaah!
			res.render('index', {
				title : 'ListRatr',
				lists : lists,
				isAdmin : false
			});
		}
	});	
}

function signupGET (req, res, next) {
	res.render('signup', { 
		title: 'Signup' 
	});
}

function signupPOST (req, res, next) {
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
				listratr.save();

				res.send(listratr);
			}
		}
	});
}

function signinGET (req, res, next) {
	res.render('signin', { 
		title: 'Signin' 
	});
}

function signinPOST (req, res, next) {
	// get form data
	var email = req.body.email;
	var password = req.body.password;

	ListRatr.findOne({email : email}, function (err, ratr) {
		if (err) {
			res.send(err);
		} else {
			if (ratr) {
				// save session
				req.session.ratr = ratr;	

				console.log('good: ratr found');
				res.send(ratr);
			} else {
				console.log('bad: ratr does not exist');
				res.send('bad: ratr does not exist');
			}
		}
	});
}

function profileGET (req, res, next) {
	var ratr = req.session.ratr;

	if (ratr) 
		res.send(ratr);
	else 
		res.send('bad: ratr undefined');
}

function listsGET (req, res, next) {
	// get ratrId
	var ratr = req.session.ratr;
	var ratrId;
	if (ratr)
		ratrId = ratr._id;
	else
		res.send('bad: no user logged in on this session');

	// get first list from db
	List.find({}, function (err, lists) {
		if (err) 
			res.send(err);
		else {
			// pseudo: in future top list should be list with highest rank/score
			// for now assume first list to be top list
			// topList = lists[0];
			// res.send(lists);

			console.log('\n\nlists before sort:\n');
			console.log(lists);
			console.log('\n\n');

			// rank now! (based on likes for now)
			lists = sortByLikes(lists);
			console.log('\n\nlists after sort:\n');
			console.log(lists);
			console.log('\n\n');

			// rendaaah!
			res.render('lists', {
				title : 'ListRatr - Lists',
				lists : lists,
				isAdmin : false
			});
		}
	});	
}

// sort lists by likes ind descending order
// (highest likes first)
/* NEXT PLAN :
	shiftRank() on back-end on every /like
	so on /lists. simply pick, for example, top 10

	shiftRank() :
		move up an object step by step until 
*/
function sortByLikes (lists) {
	return lists.sort(function (a, b) {

		console.log('a.likes:');
		console.log(a.likes);
		console.log('b.likes:');
		console.log(b.likes);

		return b.likes - a.likes;
	});
}

function CreateListGET (req, res, next) {
	// get ratr
	var ratr = req.session.ratr;

	// render create list page
	res.render('create-list', {
		title : 'Create List'
	});
}

function createListPOST (req, res, next) {
	// get ratr
	var ratr = req.session.ratr;

	// get form data
	var formData = req.body;

	// var listTitle = "3 Things to do before coding";
	// var items = [{
	// 	header : 'Drink Coffee',
	// 	content : "Yo, you gotta this first. Coffee gives you spirit",
	// 	scoreRank : 10
	// }, {
	// 	header : 'Open Powershell',
	// 	content : "It simply powers you up and puts you on the right track",
	// 	score : 6		
	// }, {
	// 	header : 'Open Sublime Text',
	// 	content : "Sublime makes you actually start coding, really",
	// 	score : 3		
	// }];

	// EXTRACT FORM DATA
	var listTitle = formData.title;

	// create items
	var items = [];
	var panelTitles = formData.panelTitle;
	var panelBodies = formData.panelBody;
	for (i in panelTitles) {
		var item = {
			header : panelTitles[i],
			content : panelBodies[i]
		};
		items.push(item);
	}

	var list = new List ({

		// id : new ObjectId(),
		dataCreated: new Date(),
		owner : ratr._id,

		//* MAIN INFORMATION *//
		title : listTitle,
		// array of items
		items : items,
		// list's number of upvotes
		votes : 0,
	});
	// save newly created list
	list.save(function (err) {
		if (err)
			res.send(err);
		else 
			res.send(list);
	});
	
	// res.send(formData);

	// res.send(list);
}

function ratrIdGET (req, res, next) {
	// get ratr
	// var ratr = req.session.ratr;

	// get ratrId from url
	var ratrId = req.params.ratrId;

	if (ratrId != req.session.ratr._id) {
		var activeRatr = req.session.ratr;
		if (activeRatr)
			res.send('not your id, ' + activeRatr.email);
		else
			res.send('sign in to be a list ratr');
	} else {
		// get all lists
		List.find({owner : ratrId}, function (err, lists) {
			if (err)
				res.send(err);
			else 
				// res.send(lists);
				res.render('my-lists', {
					title : 'My Lists',
					lists : lists,
					nLists : lists.length
				});
		});
	}

	// get from db all the lists that belong to ratr
	// var query = {
	// 	owner : ratr._id
	// }
	// List.find(query, function (err, lists) {
	// 	if (err)
	// 		res.send(err);
	// 	else {
	// 		res.send(lists);
	// 	}
	// });
}

function likePOST (req, res, next) {
	var ratr = req.session.ratr;

	// expects a req.body.listId;
	var listId = req.body.listId;

	if (!ratr)
		res.send('bad: please login to like');

	else {
		var ratrId = ratr._id;

		updateListLikes (res, {
			listId : listId,
			ratr : ratr
		});
	}
}

module.exports = router;

///////////////////////////////////////
///		 	HELPER FUNCTIONS 		///
///////////////////////////////////////

function updateListLikes (res, body) {
	var listId = body.listId;
	var ratr = body.ratr;
	// var listId = list._id;

	List.findById(listId, function (err, list) {
		if (err) {
			res.send(err);
		} else {
			// // increse list's likes
			// list.likes += 1;
			
			// update list score
			// list.score += topRank(bla bla)

			// list.save(function (err) {
			// 	if (err) {
			// 		res.send(err);
			// 	} else {

			// update ratr's likes then send response
			updateRatrLikes(res, {
				list : list,
				ratr : ratr
			});

			// 	}
			// });
		}
	});
}

function updateRatrLikes (res, body) {
	var list = body.list;
	var ratr = body.ratr;
	var ratrId = ratr._id;
	var listId = list._id;

	// update ratr's likes
	ListRatr.findById(ratrId, function (err, ratr) {
		if (err) {
			res.send(err);
		} else {
			var response;


			// if ratr has liked, ratr.likes.remove(list) & list.likes--
			// else, ratr.likes.push(list) & list.likes++
			if (hasLiked(ratr, list)) {
				// remove list from ratr.likes
				ratr.likes.splice(ratr.likes.indexOf(list._id), ratr.likes.length);
				// decrement list.likes
				list.likes--;
				// set success response then send
				response = {
					ratr : ratr,
					list : list,
					status : 'success: unlike'
				};				
			} else {
				// push list to ratr.likes
				ratr.likes.push(listId);
				// increment list.likes
				list.likes++;
				// set success response then send
				response = {
					ratr : ratr,
					list : list,
					status : 'success: like'
				};				
			}

			// save both
			ratr.save();
			list.save();

			res.send(response);


			// // save updates
			// ratr.save(function (err) {
			// 	if (err) {
			// 		res.send(err);
			// 	} else {

			// 		// set success response then send
			// 		var response = {
			// 			ratr : ratr,
			// 			list : list
			// 		};
			// 		res.send(response);
			// 	}
			// });
		}
	});	
}

// ratr is ratr Mongo Object, 
// list is list Mongo Object
function hasLiked (ratr, list) {

	if (ratr.likes.indexOf(list._id) === -1) {
		return false;
	} else {
		return true;
	}
}