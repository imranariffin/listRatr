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

var websites = ['www.narcity.com'];
var parsers = {
	'www.narcity.com' : {
		getTitle : getNarcityTitle,
		getHeaders : getNarcityHeaders,
		getContents : getNarcityContents
	}
	// , 'lifehacker.com' : {
	// 	getTitle : getLHTitle,
	// 	getHeaders : getLHHeaders,
	// 	getContents : getLHContents
	// }
};
/* GET home page. */
router.post('/', listrize);

// input url of an article
// if article is a non listrizable, return false
// else listrize it (turn's into listratr list object)
function listrize (req, res, next) {

	var url = req.body.url;
	var articleHomePage = getHomePage(url);
	var title;
	var headers;
	var contents;

	request (url, function (err, response, body) {
		if (!err && response.statusCode === 200)  {
			// good
			var $ = cheerio.load(body);

			// if narcity.com, user narcity method
			// if (articleHomePage === websites['narcity']) {
			if (websites.indexOf(articleHomePage) != -1) {
				// // use narcity method to get listTitle and listItems
				// title = getNarcityTitle($);
				// headers = getNarcityHeaders($);
				// contents = getNarcityContents($, headers);
				title = parsers[articleHomePage].getTitle($);
				headers = parsers[articleHomePage].getHeaders($);
				contents = parsers[articleHomePage].getContents($);

				// change items to an object to include
				items = headers.map(function (e, i, arr) {
					return {
						index : i,
						heading : e,
						content : contents[i]
					};
				});

				var list = {
					title : title,
					items : items,
					listSize : items.length
				};

				res.render('create-list-auto', {
					// main data
					list : list,

					// 
					partials : {
						header : 'header',
						footer : 'footer-create-lists'
					}
				});
			} else {
				res.send('parser for this website not available yet');
			}
		} else {
			res.send(err);
		}
	});
}

module.exports = router;


// function titleFinder (selector, callback) {

// }

////////////////////////
/* SCRAPING FUNCTIONS */
////////////////////////

// // find title of html page
// // input $ is of cheerio.load(htmlFIle) type
// function findTitle ($) {
// 	var $title, title;

// 	// find by tag <title>
// 	$title = $('title');
// 	if ($title) {
// 		return $title.text();
// 	}

// 	// if that doesn't work
// 	// find by other strategies

// 	// if every strategy doesn't work, return undefined
// 	else {
// 		return undefined;
// 	}
// }

// function getTitle ($) {
// 	console.log('\nIN FUNCTION: getTitle():\n');

// 	// try first method: try <h9, h8, h7 ... h1> tags
// 	var found = false;
// 	var title;
// 	var i=9;
// 	while (!found && i>0) {
// 		$('div' + String(i)).filter(function () {
// 			var data = $(this);

// 			if (data) {
// 				if (data.text().indexOf('Want') != -1) {
// 					title = data.text();
// 				}
// 			}
// 		});
// 		i--;
// 	}

// 	// if title found, return. 
// 	// Else, continue with other methods
// 	if (title)
// 		return title;

// 	// second method: try <p class="title">
// 	var selectors = ['div', 'p', 'title'];

// 	for (i in selectors) {
// 		var selector = selectors[i];
// 		$(selector).filter(function () {
// 			var data = $(this);

// 			// TEST
// 			console.log('\n\n');

// 			console.log(selector);
// 			console.log('\n\n');
// 			if (data) {
// 				console.log('data.text():');
// 				console.log(data.text());
// 				console.log('data:');
// 				console.log(data);
// 				console.log("data.attr('class'):");
// 				console.log(data.attr('class'));
// 			}

// 			if (data) 
// 				if (data.attr('class') === 'title' && data.text().indexOf('Want') != -1) 
// 					title = data.text();
// 		});
// 	}
// }

// // find lists
// // list should be found when an article has sub-headers 
// // Input $ is of cheerio.load(htmlFile) type
// function findList ($) {
// 	var $subArticle, $list, list;

// 	// star with the most obvious: find by bold <ol> tags
// 	$list = $('ol');
// 	if ($list) {
// 		// got list, now get headers only
// 		console.log('$list:');
// 		console.log($list);
// 		// then get item content only

// 		return $list.contents();
// 	} else {
// 		return undefined;
// 	}
// }

// function findListByArticle ($) {

// 	var jsonBody, title;
// 	var i=0;

// 	if (!title) {
// 		return undefined;
// 	} else {
// 		// proceed to getting of list items
// 		return String(title);
// 	}

// }

// should work for any kind of url
function getHomePage (fullUrl) {
	return fullUrl.split('/').filter(function (character) {
		return (character != "" && character != 'http:');
	})[0];
}

function getNarcityTitle ($) {
	// console.log('\nIN FUNCTION: getNarcityTitle():\n');
	var title;
	$('h1').filter(function () {
		var data = $(this);
		if (data.attr('class') === 'article__title') {
			title = data.text();
		}
	});
	if (title)
		return title;
}

function getNarcityHeaders ($) {
	console.log('\nIN FUNCTION: getNarcityHeaders():\n');
	var items = [], length;
	length = $('.article__content').find('h3')
	.each(function (i, e) {
		length = $(this).length;

		$(e).filter(function () {
			var data = $(this);
			if (data.text() != "" && items.indexOf(data.text()) === -1) 
				items.push(data.text());
		});
	}).filter(function() {
		return ($(this).text() != "");
	}).length;

	return items;
}

function getNarcityContents ($, narcityHeaders) {
	// console.log('\nIN FUNCTION: getNarcityContents():\n');
	var contents = [], length;
	
	length = $('.article__content').find('h3')
		.each(function (i, e) {
			length = $(this).length;

			var nextP = $(e).next('p');
			var nextPEmpty = (nextP.text() === '' || nextP.text().length === 0);
			var parentIsListItem = $(e).parent().is('li');

			if (nextPEmpty && parentIsListItem)
				contents.push('err'); // dummy list item content
			else {
				nextP.filter(function () {
					// console.log("\nINSIDE: " + nextP.text() + " .filter()\n");
					var data = $(this);
					var oredyPushed = (contents.indexOf(data.text()) != -1);
					var pHasGarbage = (data.text().indexOf("Photo cred") === -1);

					if ( pHasGarbage && !oredyPushed) 
						contents.push(data.text());
				});				
			}
		}).filter(function () {
			// filter out garbage to get correct number of paragraph
			return ($(this).next('p').text().indexOf("Photo cred") === -1);
	}).length;

	return contents;
}