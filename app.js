var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var sessions = require('client-sessions');

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