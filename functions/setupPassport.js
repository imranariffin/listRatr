
var config = require('../auth/config');
var ListRatr = require('../schemas/listratr');

// require strategies
var FacebookStrategy = require('passport-facebook').Strategy;
// var GoogleStrategy = require('passport-google-oauth').Strategy;

// parser for fb profile picture
var request = require('request');
var cheerio = require('cheerio');

function setupPassport (app, passport) {

  passport.serializeUser(function (user, done) {
    done(null, user);
  });
  passport.deserializeUser(function (obj, done) {
    done(null, obj);
  });

  //Facebook Strategy
  passport.use(new FacebookStrategy({
      clientID      : config.facebook.clientID,
      clientSecret  : config.facebook.clientSecret,
      callbackURL   : config.facebook.callbackURL
  },
    function (accessToken, refreshToken, profile, done) {
      process.nextTick(function () {
        console.log('\n');
        console.log('in passport.use()');
        console.log('succces fb-login: now time for db codes');
        console.log('\n');

        console.log('in profile: ');
        for (i in profile) {
          var item = profile[i];
          console.log('item ' + i + ' ' + item);
        }

        console.log('profile.emails[0].value: ' + profile.emails[0].value);

        var updateFacebook = false;
        var createNewUser = false;
        var addFacebook = false;

        //find user using profile given be Facebook
        var facebookEmail = profile.emails[0].value;
        ListRatr.findOne({ email : facebookEmail }, function (err, ratr) {
          //check for error
          if (err) {
            throw err;
          } 

          //if no error
          if (ratr) {
            console.log('\n');
            console.log('good: ratr oredy exists in db');
            console.log('\n');

            // if a ratr with the same email exists
            // does that ratr has facebook profile oredy?
            if (ratr.facebook.isLinked === false) {
              // if does not, make one.
              // UPDATE ACCOUNT. ADD FACEBOOK PROFILE
              ratr.facebook = {
                profile : profile,
                accessToken : accessToken,
                refreshToken : refreshToken
              };
              // // save ratr update
              ratr.save();
              // ratr.save(function (err) {
              //   if (err) {
              //     return done(err, null);
              //   } else {
              //     // save profile to req.session.passport
              //     return done(null, profile);
              //   }
              // });

              // TEST
              console.log('TEST\n');
              console.log('done updating ratr with facebook profile;');
              console.log('ratr:');
              console.log(ratr);
              console.log('\n');

            } else {
              // proceed
              console.log('TEST\n');
              console.log('proceed');              
              console.log('ratr: oredy has .facebook');
              console.log(ratr);
              console.log('\n');              
            }
          } else {
            //update db with profile provided by Facebook
            console.log('success: ratr does not exist');
            console.log('update db');
            
            //create new ratr using profile info from Facebook
            var ratr = new ListRatr({
              // id : 'genericID'
              email       : profile.emails[0].value
              // , firstName : profile._json['first_name']
              // , lastName  : profile._json['last_name']
              , password  : 'password'
              , facebook  : {
                    isLinked : true,
                    profile : profile,
                    accessToken : accessToken,
                    refreshToken : refreshToken
              }
            });


            // /*** automatically create half-random ratrname ***/
            // /*** where ratrname = email + randomNumber ***/
            // // get letter part of email
            // var halfRandomUsername = ratr.email.slice(0, ratr.email.indexOf('@'));
            // halfRandomUsername += String(Math.round(Math.random()*10));
            // halfRandomUsername += String(Math.round(Math.random()*10));


            // console.log('TEST');
            // console.log('half-random username:');
            // console.log(halfRandomUsername);
            // console.log('');
            // user.facebook = {
            //  id     : profile.id,
            //  token  : accessToken
            // }

            console.log("TEST");
            console.log('adding facebook account:');
            console.log("ratr.facebook:");
            console.log(ratr.facebook);
            console.log("TEST END");

            // //update db
            // ratr.save(function (err) {
            //   if (err) {
            //     console.log('err: ' + err);
            //   } else {
            //     console.log('save in db success');
            //     return done(null, profile);
            //   }
            // });
            ratr.save();
          }
        });

        return done(null, profile);
      });
    }
  ));

 // //Facebook Strategy
 //  passport.use(new FacebookStrategy({
 //      clientID      : config.facebook.clientID,
 //      clientSecret  : config.facebook.clientSecret,
 //      callbackURL   : config.facebook.callbackURL
 //  },
 //    function (accessToken, refreshToken, profile, done) {
 //      process.nextTick(function () {

 //          console.log('\n\nprofile:\n');
 //          console.log(profile);
 //          console.log('');

 //          var facebookEmail = profile.emails[0].value;
 //          ListRatr.findOne({email : facebookEmail}, function (err, ratr) {
 //            if (err)
 //              return(err, null);
 //            else {
 //              if (ratr) {
 //                console.log('fb user oredy in db');
 //                console.log('therefore simply update profile picture');
 //                // update profile picture using fb profile picture
 //                // fbProfileUrl = profile.profileUrl;
 //                fbProfileUrl = 'https://graph.facebook.com/me/picture?access_token=' + accessToken;
 //                fbProfileUrl += '&redirect=false'
 //                // TEST
 //                console.log('fbProfileUrl:');
 //                console.log(fbProfileUrl);

 //                request(fbProfileUrl, function (err, response, body) {
 //                  if (err || response.statusCode != 200)
 //                    return done(err, null);
 //                  else {

 //                    console.log('body:');
 //                    console.log(body);
 //                    console.log("typeof(body):");
 //                    console.log(typeof(JSON.parse(body)));
 //                    console.log("Object.keys(body):");
 //                    console.log(Object.keys(JSON.parse(body)));

 //                    body = JSON.parse(body);

 //                    ratr.profilePicture = body.data.url;
 //                    ratr.save();

 //                    return done(null, profile);
 //                  }
 //                });
 //                // return done(null, profile);
 //              } else {
 //                console.log('fb user not yet in db');
 //                console.log('therefore simply create a new user using fb profile');
 //                // create new ratr
 //              }
 //            }
 //          });

 //          // return done(null, profile);
 //        });

 //        // return done(null, profile);
 //  }));

  app.use(passport.initialize());
  app.use(passport.session());
}

module.exports = setupPassport;