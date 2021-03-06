const Genre = require('../models/genre');
const Book = require('../models/book');
const async = require('async');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const bookinstance = require('../models/bookinstance');

// Display list of all Genre.
exports.genre_list = function (req, res) {
    Genre.find({}, 'name')
        .sort({ name: 1 })
        .exec(function (err, list_genres) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('genre_list', { title: 'Genre List', genre_list: list_genres });
        });
};

// Display detail page for a specific Genre.
exports.genre_detail = function (req, res, next) {
    let id = mongoose.Types.ObjectId(req.params.id)
    async.parallel({
        genre: function (callback) {
            Genre.findById(req.params.id)
                .exec(callback);
        },
        genre_books: function (callback) {
            Book.find({ 'genre': req.params.id })
                .exec(callback);
        }
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.genre == null) { //No results.
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        //If the request reaches this line without returning, the operation was successful.
        //Thus, it renders the results:
        res.render('genre_detail', { title: 'Genre Detail: ' + results.genre.name, genre: results.genre, genre_books: results.genre_books });
    });
};
// Display Genre create form on GET.
exports.genre_create_get = function (req, res) {
    res.render('genre_form', { title: 'Create Genre' })
};

// Handle Genre create on POST.
exports.genre_create_post = [
    //Validate and sanitize the name field
    body('name', 'Genre name required').trim().isLength({ min: 1 }).escape(),

    //Process request after validation and sanitization
    (req, res, next) => {
        //Extract the validation errors from a request
        const errors = validationResult(req)

        //Create a genre object with escaped and trimmed data
        let genre = new Genre({ name: req.body.name });

        if (!errors.isEmpty()) {
            //There are errors. Render the form again with sanitized values and error messages
            res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array() });
            return;
        }
        else {
            //Data from form is valid.
            //Check if Genre with same name already exists
            Genre.findOne({ 'name': req.body.name })
                .exec(function (err, found_genre) {
                    if (err) { return next(err) }
                    if (found_genre) {
                        //Genre exists, redirect to its detail page.
                        res.redirect(found_genre.url);
                    }
                    else {
                        genre.save(function (err) {
                            if (err) { return next(err) }
                            //Genre saved. Redirect to newly created detail page.
                            res.redirect(genre.url);
                        })
                    }
                })
        }
    }
];

// Display Genre delete form on GET.
exports.genre_delete_get = function (req, res, next) {
    async.parallel({
        genre: function (callback) { Genre.findById(req.params.id).exec(callback) },
        genre_books: function (callback) { Book.find({ 'genre': req.params.id }).exec(callback) }
    },
        function (err, results) {
            if (err) { return next(err) }
            if (results.genre == null) {//Genre does not exist. Redirect to genre list.
                res.redirect('/catalog/genres');
            }
            //Successful, so render:
            res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books })
        })
};

// Handle Genre delete on POST.
exports.genre_delete_post = function (req, res) {
    async.parallel({
        genre: function (callback) { Genre.findById(req.params.id).exec(callback) },
        genre_books: function (callback) { Book.find({ 'genre': req.params.id }).exec(callback) }
    },
        function (err, results) {
            if (err) { return next(err) }
            //Success
            if (results.genre_books.length > 0) {
                //There are still some books for this genre. Render in the same way as for GET route.
                res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books });
                return;
            }
            //This genre has no books. This means it's safe to delete the genre. So we do that and redirect to the genre list.
            Genre.findByIdAndRemove(req.params.id, function deleteGenre(err) {
                if (err) { return next(err); }
                //Success. Redirect to Genre list.
                res.redirect('/catalog/genres')
            })
        }
    )
};

// Display Genre update form on GET.
exports.genre_update_get = function (req, res) {
    Genre.findById(req.params.id, function (err, genre) {
        if (err) { return next(err) }
        //Success. Render the form and send it the Genre object.
        res.render('genre_form', { genre: genre })
    });
};

// Handle Genre update on POST.
exports.genre_update_post = [
    //Validate and sanitize the name field
    body('name', 'Genre name required').trim().isLength({ min: 1 }).escape(),

    //Process request after validation and sanitization
    (req, res, next) => {
        //Extract the validation errors from a request
        const errors = validationResult(req)

        //Create a genre object with escaped and trimmed data, and the book's old ID.
        let genre = new Genre({ name: req.body.name, _id: req.params.id });

        if (!errors.isEmpty()) {
            //There are errors. Render the form again with sanitized values and error messages
            res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array() });
            return;
        }
        else {
            //Data from form is valid.
            //Save update genre.
            Genre.findByIdAndUpdate(req.params.id, genre, {}, function (err, updatedGenre) {
                if (err) { return next(err) }
                //Success. Redirect to Genre's page
                res.redirect(updatedGenre.url)
            })
        }
    }
];