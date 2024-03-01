var createError = require('http-errors'); // Importing createError module for HTTP errors
var express = require('express'); // Importing express framework
var path = require('path'); // Importing path module for working with file paths
var cookieParser = require('cookie-parser'); // Importing cookie-parser middleware for parsing cookies
var logger = require('morgan'); // Importing morgan middleware for logging
const expressSession = require('express-session'); // Importing express-session middleware for session management
var indexRouter = require('./routes/index'); // Importing index router
var usersRouter = require('./routes/users'); // Importing users router
const passport = require('passport'); // Importing passport module for authentication
const flash = require('connect-flash'); // Importing connect-flash middleware for displaying flash messages
var app = express(); // Creating express application

// view engine setup
app.set('views', path.join(__dirname, 'views')); // Setting views directory
app.set('view engine', 'ejs'); // Setting view engine to EJS

app.use(expressSession({
  saveUninitialized: false,
  resave: false,
  secret: 'hah hah' // Secret key for session encryption
}));
app.use(flash()); // Using connect-flash middleware for flash messages

app.use(passport.initialize()); // Initializing passport middleware
app.use(passport.session()); // Using passport session middleware for session management

passport.serializeUser(usersRouter.serializeUser()); // Serializing user instances
passport.deserializeUser(usersRouter.deserializeUser()); // Deserializing user instances

app.use(logger('dev')); // Using morgan middleware for logging in development mode
app.use(express.json()); // Parsing JSON bodies
app.use(express.urlencoded({ extended: false })); // Parsing URL-encoded bodies
app.use(cookieParser()); // Parsing cookies
app.use(express.static(path.join(__dirname, 'public'))); // Serving static files from public directory

app.use('/', indexRouter); // Using index router for '/'
app.use('/users', usersRouter); // Using users router for '/users'

// Catching 404 and forwarding to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  // Setting locals, providing error only in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Rendering the error page
  res.status(err.status || 500);
  res.render('error'); // Rendering error page
});

module.exports = app; // Exporting express application
