var express = require('express');
var app = express();
//Include environment variables
require('dotenv').config()
//Node modules
var createError = require('http-errors');
var path = require('path');
var compression = require('compression');
var helmet = require('helmet');
//Express modules
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//Routers
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var catalogRouter = require('./routes/catalog'); //Import routes for "catalog" area of site

//Connecting to Database
var mongoose = require('mongoose');
var dev_db_url = 'mongodb+srv://m001-student:m001-mongodb-basics@sandbox.xw2vj.mongodb.net/library_project?retryWrites=true&w=majority';
var mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB, { useNewURLParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(compression()) //Compress all routes
app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Setting up routes

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter)

// catch 404 and forward to error handler

app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
