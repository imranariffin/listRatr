var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var sessions = require('client-sessions');
var passport = require('passport');
// custom functions
var setupPassport = require('./functions/setupPassport');

var mongoose = require('mongoose');
var ListRatr = require('./schemas/listratr');

var routes = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin');
var listrize = require('./routes/listrize');

var app = express();

var MONGO_URI = require('./auth/mongo').MONGO_URI;
// mongoose.connect(MONGO_URI, function (err) {
//   if (err) {
//     console.log(err);
//     // throw err; 
//   }
// });
var localMongo = 'mongodb://localhost/listratr';
mongoose.connect(MONGO_URI, function (err) {
  if (err) {
    console.log(err);
    // throw err; 
  }
});

setupPassport(app, passport);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

//oauth session
app.use(sessions({
  cookieName : 'session',
  secret : 'kafljslafio134asfjasoasdfasdfsdfdf',
  duration : 30 * 60 * 10000,
  activeDuration : 5 * 60 * 10000
}));

// always update session
app.use(updateSession);

app.use('/', routes);
app.use('/users', users);
app.use('/admin', admin);
app.use('/listrize', listrize);

app.get('/auth/facebook', passport.authenticate('facebook', { 
  scope : 'email' 
}), function (req, res) {
  res.redirect('/');
}
);

app.get('/auth/facebook/callback', 
  passport.authenticate('facebook'), 
  // redirectToDashboard
  redirectToMain
);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

function updateSession (req, res, next) { //user next() for next middleware

  console.log('\n');
  console.log("in updateSession()");
  console.log('\n');

  if (req.session && req.session.ratr) {

    // FIND USER by email (email is unique)
    // actually, finding by username should 
    // also work (username is also unique)
    ListRatr.findOne({ email : req.session.ratr.email }, function (err, ratr) {
      if (ratr) {

        // save user to req object
        req.ratr = ratr;
        // delete password for security
        delete req.ratr.password;

        // update session
        req.session.ratr = req.ratr;
        res.locals.ratr = req.ratr;
        console.log('session updated');
      } else {
        console.log('user is undefined');
      }

      next();
    });
  } else {
    console.log('req.session or req.session.user is false');
    next();
  }
}

// function redirectToDashboard (req, res) {
function redirectToMain (req, res) {

  console.log('redirecting to main');
  console.log('req.session.passport.user:');
  console.log(req.session.passport.user);

  ListRatr.findOne({ email : req.session.passport.user.emails[0].value }, function (err, ratr) {
    if (!err) {
      if (ratr) {
        req.session.ratr = ratr;
        console.log('req.session.ratr:');
        console.log(req.session.ratr);
        console.log('redirect to main');
        // res.redirect('/dashboard');
        res.redirect('/');
      } else {
        console.log('error: no user found');
        // res.send('error: no user found');
        // no user found, therefore create one using req.session
        var ratr = req.session.ratr;

        ratr.save(function (err) {
          if (err)
            res.send(err);
          else
            res.send(ratr);
        });
      }
    } else {
      console.log('Error: ' + err);
      res.send('Error: ' + err);
    }
  });
}