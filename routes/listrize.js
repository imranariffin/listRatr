var express = require('express');
var router = express.Router();

// configure db 
var mongoose = require('mongoose');
var ListRatr = require('../schemas/listratr');
var List = require('../schemas/list');
var ObjectId = mongoose.Schema.ObjectId;

// web parsing
var request = require('request');
var cheerio = require('cheerio');

/* GET home page. */
router.post('/', listrize);

// input url of an article
// if article is a non listrizable, return false
// else listrize it (turn's into listratr list object)
function listrize (req, res, next) {

	var url = req.body.url;

	request (url, function (err, response, body) {
		if (!err && response.statusCode === 200)  {
			// good
			// res.send(body);

			var $ = cheerio.load(body);

			// var title = findTitle($);
			// if (title) {
			// 	// // find lists
			// 	// var lists = findLists($);
			// 	// if (lists) {
			// 	// 	res.send('success');
			// 	// } else {
			// 	// 	res.send('err: cannot find lists');
			// 	// }
			// 	res.send('success findTitle: title = ' + title);
			// } else {
			// 	res.send('err: cannot find title');
			// }

			// var list = findList ($);
			// if (list) {
			// 	res.send(list);
			// } else {
			// 	res.send('err fail finding list');
			// }
			// var titleFound
			// while ()

function getTitle ($) {

	// try first method: try <h9, h8, h7 ... h1> tags
	var found = false;
	title;
	var i=9;
	while (!found && i>0) {
		$('div' + String(i)).filter(function () {
			var data = $(this);

			// TEST
			if (data) {
				console.log('data.text():');
				console.log(data.text());
				console.log('typeof(data):');
				console.log(typeof(data));
			}
			console.log('i:');
			console.log(i);

			// res.send(data.toString());
			if (data) {
				if (data.text().indexOf('Want') != -1) {
					// res.send('success: ' + data.text());
					title = data.text();
				}
			}
		});
		i--;
	}

	console.log('\n');
	console.log('title: ');
	console.log(title);
	console.log('\n');

	// if title found, return. 
	// Else, continue with other methods
	if (title)
		return title;

	// second method: try <p class="title">
	var selectors = ['div', 'p', 'title'];

	for (i in selectors) {
		var selector = selectors[i];
		$(selector).filter(function () {
			var data = $(this);

			// TEST
			console.log('\n\n');

			console.log(selector);
			console.log('\n\n');
			if (data) {
				console.log('data.text():');
				console.log(data.text());
				console.log('data:');
				console.log(data);
				console.log("data.attr('class'):");
				console.log(data.attr('class'));
			}

			if (data) 
				if (data.attr('class') === 'title' && data.text().indexOf('Want') != -1) 
					title = data.text();
		});
	}
}

			var title = getTitle ($);

			if (title)
				res.send(title);
			else
				res.send('err: cannot find title');

			// res.send('typeofz');

			// // var list = findListByArticle($);
			// if (list) {
			// 	res.send(list);
			// } else {
			// 	res.send('fail finding list');
			// }


		} else if (err) {
			// bad
			res.send(err);
		} else {
			// worse
			res.send(response);
		}
	});
}

module.exports = router;


function titleFinder (selector, callback) {

}

////////////////////////
/* SCRAPING FUNCTIONS */
////////////////////////

// find title of html page
// input $ is of cheerio.load(htmlFIle) type
function findTitle ($) {
	var $title, title;

	// find by tag <title>
	$title = $('title');
	if ($title) {
		return $title.text();
	}

	// if that doesn't work
	// find by other strategies

	// if every strategy doesn't work, return undefined
	else {
		return undefined;
	}
}

// find lists
// list should be found when an article has sub-headers 
// Input $ is of cheerio.load(htmlFile) type
function findList ($) {
	var $subArticle, $list, list;

	// star with the most obvious: find by bold <ol> tags
	$list = $('ol');
	if ($list) {
		// got list, now get headers only
		console.log('$list:');
		console.log($list);
		// then get item content only

		return $list.contents();
	} else {
		return undefined;
	}
}

function findListByArticle ($) {

	var jsonBody, title;
	var i=0;

	if (!title) {
		return undefined;
	} else {
		// proceed to getting of list items
		return String(title);
	}

}