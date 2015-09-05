var express = require('express');
var router = express.Router();

// configure db 
var mongoose = require('mongoose');
var ListRatr = require('../schemas/listratr');
var List = require('../schemas/list');
var ObjectId = mongoose.Schema.ObjectId;

// graph
var request = require('request');


/* GET home page. */
router.get('/', homeGET);

/***********OAuth Routes*********/
/* GET signup page. */
router.get('/signup', signupGET);
/* POST signup form. */
router.post('/signup', signupPOST);
/* GET signout */
router.get('/signout', signout);
/* GET signin page. */
router.get('/signin', signinGET);
/* POST signup form. */
router.post('/signin', signinPOST);

/***********Lystr Routes*********/
/* GET ratrs's profile page. */
router.get('/lystr', profileGET);
/* GET one ratr info page by ratrId. */
router.get('/ratr/:ratrId', getRatr);
/* GET one lystr info page by lystrId. */
router.get('/lystr/:ratrId', getRatr);
/* GET: ratrs's list page by ratrId. */
router.get('/mylists/:ratrId', ratrIdGET);
/* POST: ratr likes a list */
router.post('/like', likePOST);
/* GET: ratr shares a list by acquiring the link*/
router.get('/share', shareGET);
/* POST: ratr upvotes a list item */
router.post('/upVote', upVote);
/* POST: ratr gives a comment on a list item */
router.post('/postComments', giveComment);
/* GET: SEND lystrs given arr of lystIds */
router.get('/lystrs', lystrsGET);

/***********List Routes*********/
/* GET all lists. */
router.get('/lists', listsGET);
/* GET a list's individual page by listName. */
router.get('/lists/:listName', getOneListByName);
/* GET ratrs's create list page. */
router.get('/createList', CreateListGET);
/* POST ratrs creates a new list. */
router.post('/createList', createListPOST);
/* GET: SEND. Given lystId, return yes/no answer to whether user in session 
likes this list or not */
router.get('/do-you-like-this/:listId', doYouLikeThis);

// /* GET: fb api */
// router.get('/graph', function (req, res, next) {
// 	var graphUrl = 
// 	request('graph.')
// });

//////////////////////////////////////////////////
// 				ROUTE MIDDLEWARES 				//
//////////////////////////////////////////////////

function homeGET (req, res, next) {

	// TEST
	console.log('\n\nTEST');
	console.log('req.session:');
	console.log(req.session);
	console.log('\n');

	var loggedIn = false, notLoggedIn = true;

	// get first list from db
	List.find({}, function (err, lists) {
		if (err) 
			res.send(err);
		else {
			// pseudo: in future top list should be list with highest rank/score

			// rank now! (based on likes for now)
			lists = sortByLikes(lists);

			if (req.session.ratr) {
				loggedIn = true;
				notLoggedIn = false;
			}

			// ListRatr.find({}, function (err, ratrs) {
			// 	if (err) {
			// 		res.send(err);
			// 	} else {

			// 		for (i in lists) {
			// 			var list = lists[i];
			// 			for (j in ratrs) {
			// 				var ratr = ratrs[j];
			// 				console.log('ratr.email:');
			// 				console.log(ratr.email);
			// 				// console.log('list.owner:');
			// 				// console.log(list.owner);
			// 				// console.log('ratr._id:');
			// 				// console.log(ratr._id);
			// 				if (String(list.owner) === String(ratr._id)) {
			// 					lists[i].profilePicture = ratr.profilePicture;
			// 					list.profilePicture = ratr.profilePicture;
			// 					console.log('ratr.profilePicture:');
			// 					console.log(ratr.profilePicture);
			// 					console.log('lists[i].profilePicture:');
			// 					console.log(lists[i].profilePicture);
			// 					list.save();
			// 				}
			// 			}
			// 		}

			// 		// rendaaah!
			// 		res.render('index', {
			// 			title : 'Lystr',
			// 			ratr : req.session.ratr,
			// 			xyz : '.xyz',
			// 			lists : lists,
			// 			isAdmin : false,
			// 			notLoggedIn : notLoggedIn,
			// 			loggedIn : loggedIn,
			// 			partials : {
			// 				listsContainer : 'lists-container',
			// 				header : 'header',
			// 				footer : 'footer'
			// 			}
			// 		});
			// 	}
			// });

			// rendaaah!
			res.render('index', {
				title : 'Lystr',
				ratr : req.session.ratr,
				xyz : '.xyz',
				lists : lists,
				isAdmin : false,
				notLoggedIn : notLoggedIn,
				loggedIn : loggedIn,
				partials : {
					listsContainer : 'lists-container',
					header : 'header',
					footer : 'footer'
				}
			});
		}
	});	
}

/******Lystr Middleware Functions*******/

/*GET: SEND one lystr by lystrId*/
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

/*GET: RENDER page of one active lystr, obtained from session*/
function profileGET (req, res, next) {
	var ratr = req.session.ratr;

	if (ratr) {

		var notLoggedIn = false;
		var loggedIn = true;

		res.render('profile', {
			title : 'Lystr',
			xyz : '.xyz',
			ratr : ratr,
			notLoggedIn : notLoggedIn,
			loggedIn : loggedIn,
			partials : {
				header : 'header',
				footer : 'footer'
			}
		});
	} else 
		res.send('bad: ratr undefined');
}

/*GET: RENDER 'my-lists' page, using lyster's lists */
/* identifies lystr by lystrId. A lystr can only get to see its own lists */
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
		// get all of lyster's lists
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
}

/* POST: ratr likes a list */
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

/* GET: ratr shares a list by acquiring the link*/
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

/* POST: ratr upvotes a list item */
function upVote (req, res, next) {
	var ratr = req.session.ratr;
	var itemId = req.body.itemId;
	var action = req.body.action;

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
							console.log('\naction:');
							console.log(action);
							if (action === '0To1') {
								
								list.items = updateItemScore(itemId, list.items, 1);
								ratr.votes.up.push(itemId);
								ratr.votes.down.pop(itemId);

							} else if (action === '0To-1') {
								
								list.items = updateItemScore(itemId, list.items, -1);
								ratr.votes.down.push(itemId);
								ratr.votes.up.pop(itemId);

							} else if (action === '-1To1') {

								list.items = updateItemScore(itemId, list.items, 2);
								ratr.votes.up.push(itemId);
								ratr.votes.down.pop(itemId);

							} else if (action === '1To-1') {

								list.items = updateItemScore(itemId, list.items, -2);
								ratr.votes.up.pop(itemId);
								ratr.votes.down.push(itemId);

							} else if (action === '-1To0') {

								list.items = updateItemScore(itemId, list.items, 1);
								ratr.votes.down.pop(itemId);

							} else if (action === '1To0') {

								list.items = updateItemScore(itemId, list.items, -1);
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

/* POST: ratr gives a comment on a list item */
function giveComment (req, res, next) {
	var ratr = req.session.ratr;
	var ratrId;
	// get form data
	var commentId = req.body.commentId;
	var commentsText = req.body.commentsText;
	var listId = req.body.listId;

	// console.log('req.body:');
	// console.log(req.body);
	if (!ratr)
		res.send('err: no user is logged in');	
	else {
		ratrId = ratr._id;

		List.findById(listId, function (err, list) {
			if (err)
				res.send(err);
			else {
				var comment = {
					text : commentsText,
					commenter : ratr._id,
					date : Date.now()
				}
				console.log('typeof(list.items):');
				console.log(typeof(list.items));
				console.log('list.items:');
				console.log(list.items);

				var nComments = 0;
				for (i in list.items) {
					var listItem = list.items[i];
					if (listItem.comments)
						nComments += listItem.comments.length;
				}
				// 
				list.nComments = nComments;

				for (i in list.items) {
					var listItem = list.items[i];
					if (String(listItem._id) === commentId) {
						list.items[i];
						console.log('list.items[i]:');
						console.log(list.items[i]);
						// res.send(list.items[i]);
						// break;
						list.items[i].comments.push(comment);
						list.save(function (err) {
							if (err)
								res.send(err);
						});
						// list.save(function (err) {
						// 	if (err)
						// 		res.send(err);
						// 	else
						// 		res.send(comment);
						// })

// ///////////////////////////
// function sendComment (res, data) {

// 	var ListRatr = data.ListRatr;
// 	var ratrId = data.ratrId;
// 	var commentId = data.commentId;
// 	var comments = data.comments;

// 	ListRatr.findById(ratrId, function (err, ratr) {
// 		if (err)
// 			res.send(err);
// 		else {

// 			console.log('\n\nratr:');
// 			console.log(ratr);
// 			console.log('\n');

// 			ratr.comments.push(commentId);
// 			ratr.nComments = ratr.comments.length;
// 			ratr.save();
// 			res.send({
// 				comment : comment,
// 				commentor : ratr
// 			});
// 			// break;
// 		}
// 	});
// 	// break;	
// }
// ///////////////////////////
// 						var data = {
// 							ListRatr : ListRatr,
// 							ratrId : ratrId,
// 							commentId : commentId,
// 							comments : comments
// 						};

// 						sendComment(res, {
// 							ListRatr : ListRatr,
// 							ratrId : ratrId,
// 							commentId : commentId,
// 							comments : comments
// 						});
						ListRatr.findById(ratrId, function (err, ratr) {
							if (err)
								res.send(err);
							else {

								console.log('\n\nratr:');
								console.log(ratr);
								console.log('\n');

								ratr.comments.push(commentId);
								ratr.nComments = ratr.comments.length;
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
			}
		});
	}
}

function lystrsGET (req, res, next) {
	// // get lystrIds from query string and convert into arr
	var lystrIds = req.query.lystrIds;
	lystrIds = queryStringToArr(lystrIds);

	ListRatr
		.find({})
		.where('_id').in(lystrIds)
		.exec(function (err, lystrs) {
			if (err) 
				res.send(err);
			else 
				res.send(lystrs);
		});
}

/* queryString is a string query, of type string obviously */
function queryStringToArr (queryString) {
	return queryString.split(',');
}

/******OAuth Middleware Functions*******/

/*GET: RENDER signup page */
function signupGET (req, res, next) {
	res.render('signup', { 
		title: 'Lystr - Signup',
		partials : {
			header : 'header',
			footer : 'footer'
		}
	});
}

/*POST: SUBMIT lystr signup information then either */
/*creates a new lystr or abort if oredy exists 		*/
function signupPOST (req, res, next) {

	//////////////////////////////////////
	/*ALGORITHM: 						*/
	// if (input correct)
		// if (ratr)
			// if (ratr.facebook)
				// merge accounts
				// update password
			// else
				// err: email oredy in use
		// else
			// create new ratr
			// save new ratr
	// else
		// err: incorrect input
	//////////////////////////////////////

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

/*GET: delete lystr session */
function signout (req, res, next) {
	console.log('signing out');
	req.session.reset();
	res.redirect('/');
}

/*GET: RENDER lystr signin page */
function signinGET (req, res, next) {
	res.render('signin', { 
		title: 'Lystr - Signin',
		partials : {
			header : 'header',
			footer : 'footer'
		}
	});
}

/*POST: SUBMIT lystr sign information then either 		*/
/* update session and send lystr or reject if invalid 	*/
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

/*GET: fetch all lists and sort it by decreasing likes 	*/
/* then RENDER 'lists' page 							*/
function listsGET (req, res, next) {
	// get ratrId
	var ratr = req.session.ratr;

	// get nComments
	var loggedIn = false, notLoggedIn = true;

	// get first list from db
	List.find({}, function (err, lists) {
		if (err) 
			res.send(err);
		else {
			// pseudo: in future top list should be list with highest rank/score

			// rank now! (based on likes for now)
			lists = sortByLikes(lists);

			if (req.session.ratr) {
				loggedIn = true;
				notLoggedIn = false;
			}

			// rendaaah!
			res.render('lists', {
				title : 'Lystr - Lists',
				lists : lists,
				isAdmin : false,
				loggedIn : loggedIn,
				notLoggedIn : notLoggedIn,
				partials : {
					listsContainer : 'lists-container',
					header : 'header',
					footer : 'footer'
				}
			});
		}
	});	
}

/*GET: RENDER 'list' page with an acquired list. 		*/
/* the acquired list corresponds to the unique list url */
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

			console.log('\n');
			console.log('list.items:');
			console.log(list.items);
			console.log('\n');

			if (ratr) 
				list.items.forEach(function (e, i, arr) {
					// console.log(ratr);
					// console.log(ratr.votes);
					var comments = [];

					console.log('INSIDE list.items.forEach:');
					console.log('e.comments:');
					console.log(e.comments);
					var tempComments = e.comments;

					tempComments.forEach(function (comment) {

						var commentObj = {
							_id : comment._id,
							text : comment.text,
							commenter : comment.commenter
						};
						if (comment.commenter == ratr._id)
							commentObj.deletable = true;
						else
							commentObj.deletable = false;
						comments.push(commentObj);
					});

					var itemId = String(e._id);
					var item = {
						header : e.header,
						content : e.content,
						_id : e._id,
						score : e.score,
						up : false,
						down : false,
						comments : comments
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
			// if (ratr) 
			// 	list.items.forEach(function (e, i, arr) {
			// 		// console.log(ratr);
			// 		// console.log(ratr.votes);

			// 		console.log('INSIDE list.items.forEach:');
			// 		console.log('e.comments:');
			// 		console.log(e.comments);
			// 		var comments = e.comments;

			// 		for (j in comments) {
			// 			var comment = e.comments[j];
			// 			commentObj = {
			// 				_id : comment._id,
			// 				text : comment.text,
			// 				commenter : comment.commenter
			// 			};
			// 			if (comment.commenter == ratr._id)
			// 				commentObj.deletable = true;
			// 			else
			// 				commentObj.deletable = false;
			// 			comments.push(commentObj);
			// 		}

			// 		var itemId = String(e._id);
			// 		var item = {
			// 			header : e.header,
			// 			content : e.content,
			// 			_id : e._id,
			// 			score : e.score,
			// 			up : false,
			// 			down : false,
			// 			comments : comments
			// 		};

			// 		if (ratr.votes.up.indexOf(itemId) != -1) {
			// 			console.log(itemId + ' voted up');
			// 			upVotes.push(true);
			// 			downVotes.push(false);
			// 			item.up = true;
			// 			item.down = false;
			// 		}
			// 		if (ratr.votes.down.indexOf(itemId) != -1) {
			// 			console.log(itemId + ' voted down');
			// 			upVotes.push(false);
			// 			downVotes.push(true);
			// 			item.up = false;	
			// 			item.down = true;
			// 		}
			// 		listItems.push(item);
			// 	});
			else
				listItems = list.items;

			// console.log('\nlistItems BEFORE SORT:');
			// console.log(listItems);

			// rank listItems based on item score
			listItems = listItems.sort(function (a, b) {
				return (a.score < b.score);
			});

			// console.log('\nlistItems AFTER SORT:');
			// console.log(listItems);

			// for (i in listItems) {
			// 	listItem = listItems[i];
				
			// }

			// for toggling header nav-bar
			var loggedIn = false;
			var notLoggedIn = true;

			if (req.session.ratr) {
				loggedIn = true;
				notLoggedIn = false;
			}

			res.render('list', {
				title : 'Lystr',
				listTitle : list.title,
				list : list,
			// 	listItems : listItems.sort(function (a, b) {
			// 	return (a.score < b.score);
			// }),

				loggedIn : loggedIn,
				notLoggedIn : notLoggedIn,
				lystr : ratr,

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

/* GET lystr's create list page. */
function CreateListGET (req, res, next) {
	// get ratr
	var ratr = req.session.ratr;

	var loggedIn = false, notLoggedIn = true;
	if (ratr) {
		loggedIn = true;
		notLoggedIn = false;
	}

	// render create list page
	res.render('create-list', {
		title : 'Lystr - Create List',

		loggedIn : loggedIn,
		notLoggedIn : notLoggedIn,

		partials : {
			header : 'header',
			footer : 'footer-create-lists'
		}
	});
}

/* POST lystr creates a new list. */
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
		profilePicture : ratr.profilePicture,

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

// GET:SEND. API to whether show 'you liked this list' or not on /lists and on /
function doYouLikeThis (req, res, next) {
	var lystr = req.session.ratr;
	var response = {};
	var listId = req.params.listId;

	// TEST
	console.log('req.params:');
	console.log(req.params);
	console.log('req.originalUrl:');
	console.log(req.originalUrl);

	if (lystr.likes.indexOf(listId) != -1)
		response.answer = true;
	else
		response.answer = false;

	console.log('response:');
	console.log(response);

	res.send(response);
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
		return b.likes - a.likes;
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

			// update ratr's likes then send response
			updateRatrLikes(res, {
				list : list,
				ratr : ratr
			});
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
			console.log(e._id);
			console.log('itemId:');
			console.log(itemId);
			console.log('e.score BEFORE:');
			console.log(e.score);
			e.score += score;
			console.log('e.score AFTER:');
			console.log(e.score);
		}
		return e;
	});
}


