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

			var list = findListByArticle($);
			if (list) {
				res.send(list);
			} else {
				res.send('fail finding list');
			}


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

	var title;
	var i=0;
	while (!title && i<7) {
		title = $('article').find('h' + String(i));

		i++;
	}

	if (!title) {
		return undefined;
	} else {
		// proceed to getting of list items
		return title;
	}

}