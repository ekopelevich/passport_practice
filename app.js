var express = require('express');

// Express Middlewares
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session  = require('express-session');
var passport = require('passport');

// Passport Middlewares
var LocalStrategy = require('passport-local');
var api = require('./api');

// var routes = require('./routes/index');
// var users = require('./routes/users');

var app = express();

passport.use(new LocalStrategy(function(username, password, done) {
  api.login.read( username, password )
  .then(function (results) {
      done(null, results.rows[0]);
    }).catch(function (error) {
    done(error);
  });
}));

passport.serializeUser(function (user, done) {
  done(null, JSON.stringify(user));
});

passport.deserializer(function (id, done) {
  done(null, JSON.parse(id));
});

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
  secret: 'bananas',
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.post('/login', passport.authenticate('local'),
function(req, res) {
  res.end('login successful: ' + req.user.username );
});

app.get('/secret', function(req, res) {
  if(!req.isAuthenticated()) {
    res.redirect('/login');
    return;
  }
  res.end('Top secret!!!');
});

app.post('/register', function (req, res){
  api.login.create(req.body.username, req.body.password)
  .then(function(results) {
    res.end('Register successful: ' + req.body.username);
  })
  .catch(function(error){
    res.statusCode = 409;
    res.send(error);
  });
});


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

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
