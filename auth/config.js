// var facebookCallbackUrl = 'http://localhost:3000/auth/facebook/callback';

// production:
var facebookCallbackUrl = 'http://listratr.herokuapp.com/auth/facebook/callback';

var config = {
	'facebook' : {
		'clientID' : '1620888751493470',
		'clientSecret' : 'f376d18b026e5bb842062f86cde484ab',
		// 'callbackURL' : 'http://localhost:8081/auth/facebook/callback'
		'callbackURL' : facebookCallbackUrl
	},
	'google' : {
		'clientID' : '26825232861-9s391ar2cmfus2n26b9gvq5e4kqj32gu.apps.googleusercontent.com',
		'clientSecret' : '445IvbjfV20Pan-WUIV56iBn',
		'callbackURL' : 'http://localhost:3000/auth/google/callback'
	}
};

module.exports = config;