// configure db 
var mongoose = require('mongoose');
var Lystr = require('../schemas/listratr');
var List = require('../schemas/list');
var ObjectId = mongoose.Schema.ObjectId;

// exports
exports.getLystr = getLystr;
exports.profileGET = profileGET;


/*GET: SEND one lystr by lystrId*/
function getLystr (req, res, next) {

	var lystrId = req.params.lystrId;

	Lystr.findById(ratrId, function (err, lystr) {
		if (err)
			res.send(err);
		else {
			res.send(lystr);
		}
	});
}

/*GET: RENDER page of one active lystr, obtained from session*/
function profileGET (req, res, next) {
	var lystr = req.session.lystr;

	if (lystr) {

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
		res.send('bad: lystr undefined');
}