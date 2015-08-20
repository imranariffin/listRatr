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

/* GET ratr likes a list */
router.get('/like', likePOST);

//////////////////////////////////////////////////
// 				ROUTE MIDDLEWARES 				//
//////////////////////////////////////////////////

function homeGET (req, res, next) {
  res.render('index', { title: 'ListRatr' });
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
			// rendaaah!
			res.render('lists', {
				title : 'ListRatr - Lists',
				lists : lists,
				isAdmin : false,
			});
		}
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
				res.send(lists);
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

		List.findById(listId, function (err, list) {
			if (err) {
				res.send(err);
			} else {
				// increse list's likes
				list.likes += 1;
				
				// update list score
				// list.score += topRank(bla bla)

				// update ratr's likes
				ListRatr.findById(ratrId, function (err, ratr) {
					if (err) {
						res.send(err);
					} else {
						ratr.likes.push(listId);
						
						res.send(ratr.likes);
					}
				});
			}
		});
	}
}

module.exports = router;
