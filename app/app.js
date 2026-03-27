var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var apiV1Router = require('./src/api-v1/interfaces/http/routes/v1-router');
const { HttpError } = require('./src/api-v1/domain/errors/HttpError');


var app = express();
const passport = require('passport');
const session = require('express-session');
const dotenv = require('dotenv');
const { env } = require('process');
dotenv.config({ quiet: true });
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 3600000,
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('session'));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/', authRouter);
app.use('/api/v1', apiV1Router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  const isApi = req.originalUrl && req.originalUrl.startsWith('/api/v1');

  if (isApi) {
    const status = err.status || 500;
    const payload = {
      code: err.code || (status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR'),
      message: err.message || 'Error interno',
    };
    if (err instanceof HttpError && err.details !== undefined) {
      payload.details = err.details;
    }
    if (req.app.get('env') === 'development' && err.stack) {
      payload.stack = err.stack;
    }
    return res.status(status).json(payload);
  }

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
