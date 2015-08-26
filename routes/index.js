var express = require('express');
var router = express.Router();

// configure db 
var mongoose = require('mongoose');
var ListRatr = require('../schemas/listratr');
var List = require('../schemas/list');
var ObjectId = mongoose.Schema.ObjectId;

/* GET home page. */
router.get('/', homeGET);

router.get('/ratr/:ratrId', getRatr);

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

/* GET all lists. */
router.get('/lists', listsGET);

/* GET a list's individual page. */
router.get('/lists/:listName', getOneListByName);

/* GET ratrs's create list page. */
router.get('/createList', CreateListGET);

/* POST ratrs creates a new list. */
router.post('/createList', createListPOST);

/* GET: ratrs's list page. */
router.get('/mylists/:ratrId', ratrIdGET);

/* POST: ratr likes a list */
router.post('/like', likePOST);

/* GET: ratr shares a list by acquiring the link*/
router.get('/share', shareGET);

/* POST: ratr upvotes a list item */
router.post('/upVote', upVote);

/* POST: ratr gives a comment on a list item */
router.post('/postComments', giveComment);

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
				title : 'Lystr',
				xyz : '.xyz',
				lists : lists,
				isAdmin : false,
				partials : {
					listsContainer : 'lists-container',
					header : 'header',
					footer : 'footer'
				}
			});
		}
	});	
}

function getRatr (req, res, next) {
	var ratrId = req.params.ratrId;
	ListRatr.findById(ratrId, function (err, ratr) {
		if (err)
			res.send(err);
		else {
			res.send(ratr);
		}
	});
}

function signupGET (req, res, next) {
	res.render('signup', { 
		title: 'Lystr - Signup',
		partials : {
			header : 'header',
			footer : 'footer'
		}
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
		title: 'Lystr - Signin',
		partials : {
			header : 'header',
			footer : 'footer'
		}
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
	// var ratrId;
	// if (ratr)
	// 	ratrId = ratr._id;
	// else
	// 	res.send('bad: no user logged in on this session');

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
				title : 'Lystr - Lists',
				lists : lists,
				isAdmin : false,
				partials : {
					listsContainer : 'lists-container',
					header : 'header',
					footer : 'footer'
				}
			});
		}
	});	
}

function getOneListByName (req, res, next) {
	// get ratr
	var ratr = req.session.ratr;
	// get list name from url
	var listName = req.params.listName;
	// convert listName from 'a-random-list-name' to 'aRandomListName'
	var properListName = properizeListName(listName);

	console.log('properListName:');
	console.log(properListName);

	List.findOne({title : properListName}, function (err, list) {
		if (err) 
			res.send(err);
		else if (!list) {
			res.send('no such list found');
		} else {

			var upVotes = [];
			var downVotes = [];
			var listItems = [];

			if (ratr)
				list.items.forEach(function (e, i, arr) {
					console.log(ratr);
					console.log(ratr.votes);
					var itemId = String(e._id);
					var item = {
						header : e.header,
						content : e.content,
						_id : e._id,
						score : e.score,
						up : false,
						down : false
					};

					if (ratr.votes.up.indexOf(itemId) != -1) {
						console.log(itemId + ' voted up');
						upVotes.push(true);
						downVotes.push(false);
						item.up = true;
						item.down = false;
					}
					if (ratr.votes.down.indexOf(itemId) != -1) {
						console.log(itemId + ' voted down');
						upVotes.push(false);
						downVotes.push(true);
						item.up = false;	
						item.down = true;
					}
					listItems.push(item);
				});
			else
				listItems = list.items;

			console.log('\nlistItems:');
			console.log(listItems);

			// rank listItems based on item score
			listItems = listItems.sort(function (a, b) {
				return (a.score < b.score);
			});

			res.render('list', {
				title : 'Lystr',
				listTitle : list.title,
				list : list,
				listItems : listItems,
				upVotes : upVotes,
				downVotes :downVotes,
				partials : {
					header : 'header',
					footer : 'footer'
				}
			});
		}
	});
}

// assumes list name is a string in 
// format 'a-string-that-is-good-for-url'
// assumes '-' is never at last index 
function properizeListName (listName) {

	// always capitalize first letter
	listName = listName[0].toUpperCase() + listName.slice(1, listName.length);

	// convert 'word' in '-word' to '-Word'
	for (var i=0; i<listName.length; i++) {
		var character = listName[i];
		if (character === '-') {
			// capitalize next character
			listName = listName.substr(0, i+1) + listName[i+1].toUpperCase() + listName.substr(i+2);
		}
	}

	// remove all '-' in 'word1-word2-word3'
	while (listName.indexOf('-') != -1) 
		listName = listName.replace('-', ' ');

	// // to lower case
	// listName = listName.toLowerCase();

	return listName;
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
		title : 'Lystr - Create List',
		partials : {
			header : 'header',
			footer : 'footer-create-lists'
		}
	});
}

function createListPOST (req, res, next) {
	// get ratr
	var ratr = req.session.ratr;

	// get form data
	var formData = req.body;

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

	// create unique url based on list name @ /lists/:listName
	var url = createUrl(listTitle);
	// formalize listTitle	
	listTitle = formalizeTitle(listTitle);

	var list = new List ({

		// id : new ObjectId(),
		dateCreated: new Date(),
		owner : ratr._id,

		//* MAIN INFORMATION *//
		title : listTitle,
		url : url,
		// array of items
		items : items,
		// list's number of upvotes
		votes : 0,
	});

	// save newly created list
	list.save(function (err) {
		if (err)
			res.send(err);
		else {
			res.send(list);
		}
	});
}

/* Helper functions for createListPOST */

function createUrl (listTitle) {
	var SPACE = " ";
	var HYPHEN = "-";
	var url = '/';

	// get rid of undefined strings ('')
	// while replace SPACE with HYPHEN
	// and lower case everything
	listTitle.toLowerCase().split(SPACE)
	.filter(function (word) {
		if (word === '') 
			return false;
		else 
			return true;
	})
	.map(function (e, i, arr) {
		if (i < arr.length-1)
			e += '-';
		url += e;
	});

	console.log('url:');
	console.log(url);

	return url;
}

function formalizeTitle (listTitle) {
	// #define
	var COMMA = ',';
	var SPACE = ' ';

	var formalTitle = listTitle.split(SPACE)
	.filter(function(word) {
		if (word === '') 
			return false;
		else 
			return true;
	}).map(function (e, i, arr) {
		return e[0].toUpperCase() + e.slice(1, e.length);
	}).toString();

	var temp = '';
	for (i in formalTitle) {
		var character = formalTitle[i];
		temp += character.replace(COMMA, SPACE);
	}
	formalTitle = temp;

	return formalTitle;
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
					title : 'Lystr - My Lists',
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

function shareGET (req, res, next) {
	var ratr = req.session.ratr;

	// expects req.query form client
	var listId = req.query.listId;

	List.findById(listId, function (err, list) {
		if (err)
			res.send(err);
		else if (!list)
			res.send('err: user does not exist');
		else
			res.send(list);
	});
}

function upVote (req, res, next) {
	var ratr = req.session.ratr;
	var itemId = req.body.itemId;
	var action = req.body.action;

	console.log('itemId:');
	console.log(itemId);
	console.log('action:');
	console.log(action);

	if (!ratr)
		res.send('err: please log in to upvote');
	else {
		var ratrId = ratr._id;

		List
			.findOne({})
			.where('items._id').equals(itemId)
			.exec(function (err, list) {
				if (err)
					res.send(err);
				else {
					ListRatr.findById(ratrId, function (err, ratr) {
						if (err)
							res.send(err);
						else {
							if (action === '0To1') {
								console.log('\nlist.items:');
								console.log(list.items);
								list.items = updateItemScore(itemId, list.items, 1);
								console.log('\n\nafter\nlist.items:');
								console.log(list.items);
								ratr.votes.up.push(itemId);
								// ratr.votes.down.pop(itemId);
							} else if (action === '0To-1') {
								console.log('\nlist.items:');
								console.log(list.items);
								list.items = updateItemScore(itemId, list.items, -1);
								console.log('\n\nafter\nlist.items:');
								ratr.votes.down.push(itemId);
								// ratr.votes.up.pop(itemId);
							} else if (action === '-1To1') {
								console.log('\nlist.items:');
								console.log(list.items);
								list.items = updateItemScore(itemId, list.items, 2);
								console.log('\n\nafter\nlist.items:');
								ratr.votes.up.push(itemId);
								ratr.votes.down.pop(itemId);
							} else if (action === '1To-1') {
								console.log('\nlist.items:');
								console.log(list.items);
								list.items = updateItemScore(itemId, list.items, -2);
								console.log('\n\nafter\nlist.items:');
								ratr.votes.up.pop(itemId);
								ratr.votes.down.push(itemId);
							} else if (action === '-1To0') {
								ratr.votes.down.pop(itemId);
							} else if (action === '1To0') {
								ratr.votes.up.pop(itemId);
							}

							list.save();
							ratr.save();
						}
					});
				}
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

// useful for middleware upVote()
// does not return
function updateItemScore (itemId, items, score) {
	console.log('\n\n\nINSIDE updateItemScore');
	return items.map(function (e, i, arr) {
		if (e._id.toString() === itemId) {
			e.score += score;
		}
		return e;
	});
}

function giveComment (req, res, next) {
	var ratr = req.session.ratr;
	var ratrId = ratr._id;
	// get form data
	var commentId = req.body.commentId;
	var commentsText = req.body.commentsText;
	var listId = req.body.listId;

	console.log('req.body:');
	console.log(req.body);

	List.findById(listId, function (err, list) {
		if (err)
			res.send(err);
		else {
			var comment = {
				text : commentsText,
				commenter : ratr._id,
				date : new Date()
			}
			console.log('typeof(list.items):');
			console.log(typeof(list.items));
			console.log('list.items:');
			console.log(list.items);
			// res.send('done');

			// list.items.forEach(function (e, i, arr) {

			// });
			for (i in list.items) {
				var listItem = list.items[i];
				if (listItem._id.toString() === commentId) {
					list.items[i];
					console.log('list.items[i]:');
					console.log(list.items[i]);
					// res.send(list.items[i]);
					// break;
					list.items[i].comments.push(comment);
					// list.save(function (err) {
					// 	if (err)
					// 		res.send(err);
					// 	else
					// 		res.send(comment);
					// })
					ListRatr.findById(ratrId, function (err, ratr) {
						if (err)
							res.send(err);
						else {
							list.save();
							ratr.comments.push(commentId);
							ratr.save();
							res.send({
								comment : comment,
								commentor : ratr
							});
							// break;
						}
					});
					break;
				}

			}

			// .comments.push(comment)
			// .save(function (err) {
			// 	if (err)
			// 		res.send(err);
			// 	else
			// 		res.send(comment);
			// });
		}
	});
}