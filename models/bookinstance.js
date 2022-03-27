var mongoose = require('mongoose');
const { DateTime } = require('luxon');

var Schema = mongoose.Schema;

var BookInstanceSchema = new Schema(
  {
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true }, //reference to the associated book
    imprint: { type: String, required: true },
    status: { type: String, required: true, enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'], default: 'Maintenance' },
    due_back: { type: Date, default: Date.now }
  }
);

// Virtual for bookinstance's URL
BookInstanceSchema
  .virtual('url')
  .get(function () {
    return '/catalog/bookinstance/' + this._id;
  });
//Formatted Due Date
BookInstanceSchema
  .virtual('due_back_formatted')
  .get(function() {
    let formatted_date = ''
    formatted_date+= DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATE_MED);
    return formatted_date
  })
//Format Date to YYYY-MM-DD
BookInstanceSchema
  .virtual('due_back_for_forms')
  .get(function(){
    let formatted_date = '';
    formatted_date+= this.due_back.toISOString().split('T')[0];
    return formatted_date
  })
//Export model
module.exports = mongoose.model('BookInstance', BookInstanceSchema);
