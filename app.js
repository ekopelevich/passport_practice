var express = require( 'express' );

// Express Middlewares
var cookieParser = require( 'cookie-parser' );
var bodyParser = require( 'body-parser' );
var path = require( 'path' );
var routes = require('./routes/index');
var session  = require( 'express-session' );
var passport = require( 'passport' );

// Passport Middlewares
var LocalStrategy = require( 'passport-local' );
var api = require( './api' );

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Configure Passport to use localStrategy
// Query Postgres and return error or a user object
passport.use( new LocalStrategy( function( username, password, done ) {
  api.login.read( username, password )
  .then(function ( results ) {
      // Success
      done( null, results.rows[0] );
    }).catch( function ( error ) {
      // Error
      done(error);
    });
}));

// Create the session string in the cookie
passport.serializeUser( function ( user, done ) {
  done( null, JSON.stringify( user ));
});

// ORDER OF THESE MIDDLEWARE MATTERS...
// 'cookieParser', 'bodyParser', and 'session' need to come before 'passport' and 'cookieParser' needs to come before 'session'
app.use( cookieParser() );
app.use( bodyParser.urlencoded( {extended: false} ) );
app.use( session( {
  secret: 'bananas',
  resave: true,
  saveUninitialized: true
}));
app.use( express.static(path.join(__dirname, 'public')));
app.use( '/', routes );

// Initialize Passport
app.use( passport.initialize());

// Tell passprt to handle sessions
app.use(passport.session());

// Client gives  server a cookie that was created with serializeUser
// Deserialize will unencrypt the cookie string and retrieve the user
passport.deserializeUser( function ( id, done ) {
  done( null, JSON.parse( id ));
});

// This is when the user can authenticate
app.post( '/login', passport.authenticate( 'local' ),
function( req, res ) {
  res.end( 'login successful: ' + req.user.username );
});

app.get( '/secret', function( req, res ) {
  if( !req.isAuthenticated() ) {
    res.redirect( '/login' );
    return;
  }
  res.end( 'Top secret!!!' );
});

app.post( '/register', function ( req, res ){
  api.login.create( req.body.username, req.body.password )
  .then( function( results ) {
    res.end( 'Register successful: ' + req.body.username );
  })
  .catch( function( error ){
    res.statusCode = 409;
    res.send( error );
  });
});

// Removes the current session
// After hitting this route, the user will have to login again to authenticate
app.post( '/logout', function ( req, res ) {
  req.logout();
  res.end( 'You\'ve been logged out.' );
});

// error handlers

// development error handler
// will print stacktrace
if ( app.get( 'env' ) === 'development' ) {
  app.use(function(err, req, res, next ) {
    res.status( err.status || 500 );
    res.render( 'error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use( function( err, req, res, next ) {
  res.status( err.status || 500 );
  res.render( 'error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;

// app.listen(8080, function() {
//   console.log('Listening on port 8080');
// });
