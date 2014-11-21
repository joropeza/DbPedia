var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define the User Schema
var resourceSchema = new Schema({
	label: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    comment: { type: String, required: true },
    description: { type: String, required: false },
    birthDate: { type: Date, required: true },
    deathDate: { type: Date, required: false },
    _id: { type: Number, required: true, unique: true }
    
});

// The primary user model
var Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;