var mongoose = require('mongoose');
const { DateTime } = require('luxon');

var Schema = mongoose.Schema;

var AuthorSchema = new Schema(
  {
    first_name: { type: String, required: true, maxLength: 100 },
    family_name: { type: String, required: true, maxLength: 100 },
    date_of_birth: { type: Date },
    date_of_death: { type: Date },
  }
);
// Virtual for author's full name
AuthorSchema
  .virtual('name')
  .get(function () {
    // To avoid errors in cases where an author does not have either a family name or first name
    // We want to make sure we handle the exception by returning an empty string for that case
    var fullname = '';
    if (this.first_name && this.family_name) {
      fullname = this.family_name + ', ' + this.first_name
    }
    if (!this.first_name || !this.family_name) {
      fullname = '';
    }
    return fullname;
  });

// Virtual for author's lifespan
AuthorSchema.virtual('lifespan').get(function () {
  let lifetime_string = '';
  if (this.date_of_birth) {
    lifetime_string = this.date_of_birth.toString();
  }
  lifetime_string += ' - ';
  if (this.date_of_death) {
    lifetime_string += this.date_of_death.toString()
  }
  return lifetime_string;
});
// Virtual for author's URL
AuthorSchema
  .virtual('url')
  .get(function () {
    return '/catalog/author/' + this._id;
  });

//Virtual for a more easily readable author lifespan

AuthorSchema
  .virtual('lifespan_formatted')
  .get(function () {
    let lifetime_string = '';
    this.date_of_birth ? lifetime_string = DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED) : '';
    lifetime_string += ' - ';
    this.date_of_death ? lifetime_string += DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED) : '';
    return lifetime_string;
  })
AuthorSchema
  .virtual('date_of_birth_for_forms')
  .get(function(){
    let formatted_date = '';
    formatted_date+= this.date_of_birth.toISOString().split('T')[0];
    return formatted_date
  })
AuthorSchema
  .virtual('date_of_death_for_forms')
  .get(function(){
    let formatted_date = '';
    formatted_date+= this.date_of_death.toISOString().split('T')[0];
    return formatted_date
  })
//Export model
module.exports = mongoose.model('Author', AuthorSchema);
