
var config = require('../auth/config');
var ListRatr = require('../schemas/listratr');

// require strategies
var FacebookStrategy = require('passport-facebook').Strategy;
// var GoogleStrategy = require('passport-google-oauth').Strategy;

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

        //find user using profile given be Facebook
        ListRatr.findOne({ 
          email : profile.emails[0].value 
        }, function (err, ratr) {
          //check for error
          if (err) {
            throw err;
          } 

          //if no error
          if (ratr) {
            console.log('\n');
            console.log('success: ratr exists');
            console.log('\n');

            // console.log()

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
              // save ratr update
              ratr.save(function (err) {
                if (err) {
                  return done(err, null);
                } else {
                  return done(null, profile);
                }
              });

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

            //update db
            ratr.save(function (err) {
              if (err) {
                console.log('err: ' + err);
              } else {
                console.log('save in db success');
                return done(null, profile);
              }
            });
          }
        });

        return done(null, profile);
      });
    }
  ));

  app.use(passport.initialize());
  app.use(passport.session());
}

module.exports = setupPassport;