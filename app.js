var express = require('express');
var app = express();

//Node modules
var createError = require('http-errors');
var path = require('path');

//Express modules
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//Routers
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var catalogRouter = require('./routes/catalog');

//Connecting to Database
var mongoose = require('mongoose')
var mongoDB = 'mongodb+srv://m001-student:m001-mongodb-basics@sandbox.xw2vj.mongodb.net/library_project?retryWrites=true&w=majority'
mongoose.connect(mongoDB, { useNewURLParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error'));

var Book = require('./models/book.js')
var Author = require('./models/author.js')
var BookInstance = require('./models/bookinstance.js')
let bobSmith = new Author({
  firstName: 'Bob',
  familyName: 'Smith'
})
let someBook = new Book({
  title: 'hello',
  author: bobSmith._id,
  yearWritten: '1993'
})
let saveAuthor = (newAuthor) => {
  newAuthor.save((err, success) => {
    if (err) console.log(err);
    else console.log(success);
  })
}
let saveBook = (newBook) => {
  newBook.save((err, success) => {
    if (err) console.log(err);
    else console.log(success)
  })
}
// saveAuthor(bobSmith);
// saveBook(someBook);
Book
  .findOne({ title: 'hello' })
  .populate('author')
  .exec((err, success) => { if (err) return err; else console.log('Successful! ' + success) })

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

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
