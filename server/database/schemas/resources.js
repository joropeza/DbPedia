var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define the User Schema
var resourceSchema = new Schema({
    _id: Number,
	label: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    comment: { type: String, required: true },
    description: { type: String, required: false },
    birthDate: { type: Date, required: true },
    deathDate: { type: Date, required: false },
    influencedBy: [{
    	label: { type: String },
        wikiId: {type: Number},
        birthDate: {type: Date},
        deathDate: {type: Date}

    }],
    influenced: [{
        label: { type: String },
        wikiId: {type: Number},
        birthDate: {type: Date},
        deathDate: {type: Date}

    }]
    
});

// The primary user model
var Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;