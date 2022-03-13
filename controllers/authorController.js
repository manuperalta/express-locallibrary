const Author = require('../models/author');
const Book = require('../models/book');
const async = require('async');
const { body, validationResult } = require('express-validator');


//Display list of all Authors
exports.author_list = (req, res, next) => {
    Author.find()
        .sort([['family_name', 'ascending']])
        .exec(function (err, list_authors) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('author_list', { title: 'Author List', author_list: list_authors })
        })
};

//Display detail page for a specific Author
exports.author_detail = (req, res, next) => {
    async.parallel({
        author: function (callback) {
            Author.findById(req.params.id).exec(callback)
        },
        author_books: function (callback) {
            Book.find({ 'author': req.params.id })
                .exec(callback)
        }
    }, function (err, results) {
        if (err) { return next(err) }
        if (results.author == null) {//No results.
            var err = new Error('Author not found');
            err.status = 404;
            return next(err);
        }
        //Successful, so render
        res.render('author_detail', { title: "Author Detail", author: results.author, author_books: results.author_books })
    });
}
//Display Author create form on GET
exports.author_create_get = (req, res, next) => {
    res.render('author_form', { title: 'Create Author' });
};

//Handle Author create on POST
exports.author_create_post = [
    body('first_name').trim().isLength({ min: 1 }).escape().withMessage('Name must be specified')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters'),
    body('family_name').trim().isLength({ min: 1 }).escape().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601().toDate(),

    //Process request after validation and sanitization
    (req, res, next) => {
        //Extract the validation errors from a request
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            //There are errors. Render form again with sanitized values and error messages
            res.render('author_form', { title: 'Create Author', author: req.body, errors: errors.array });
            return;
        }
        else {
            //Data from form is valid.
            //Create an Author object with escaped and trimmed data.
            let author = new Author({
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death
            });
            author.save(function(err){
                if (err) { return next(err); }
                //Successful; redirect to new author record.
                res.redirect(author.url)
            })
        }
    }
];

//Display Author delete form on GET
exports.author_delete_get = (req, res) => {
    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id).exec(callback)
        },
        authors_books: function(callback) {
            Book.find({ 'author': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.author==null) { // No results.
            res.redirect('/catalog/authors');
        }
        // Successful, so render.
        res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books } );
    });
};

//Handle Author delete on POST
exports.author_delete_post = (req, res) => {
    res.send('NOT IMPLEMENTED: Author delete POST');
};

//Display Author update form on GET
exports.author_update_get = (req, res) => {
    res.send('NOT IMPLEMENTED: Author update GET');
};

//Handle Author update on POST
exports.author_update_post = (req, res) => {
    res.send('NOT IMPLEMENTED: Author update POST')
}

