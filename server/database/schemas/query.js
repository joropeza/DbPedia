/**
 * Our Schema for Users
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define the User Schema
var querySchema = new Schema({
    queryString: { type: String, required: true },
    results: {} // for extra information you may / may not want
});

// A method that's called every time a user document is saved..
querySchema.pre('save', function (next) {

    var query = this;

    
        return next();
   

    
});

// The primary user model
var Query = mongoose.model('Query', querySchema);

module.exports = Query;