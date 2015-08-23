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

			res.render('ratrs', { 
				title: 'admin - ratrs',
				ratrs : ratrs,
				ratrList : ratrList,
				typeofRatrs : typeof(ratrs),
				nRatrs : nRatrs
			});
		}
	});
});

/* GET all lists*/
router.get('/lists', function (req, res, next) {
	List.find({}, function (err, lists) {
		if (err) 
			res.send(err);
		else {
			// res.send(lists);
			// rendaaaahh!
			res.render('lists', {
				title : 'ListRatr - All Lists',
				lists : lists,

				// show additinal data to admin
				isAdmin : true,

				partials : {
					listsContainer : 'lists-container'
				}
			});
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

module.exports = router;
