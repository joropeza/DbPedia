/**
 * This handles the signing up of users
 */
var express = require('express');
var router = express.Router();
var moment = require('moment');
var _ = require('underscore');
var color = require('cli-color');
var db = require('../../database');
var Query = db.query;

// The POST /signup route
router.post('/', function(req, res) {

	console.log(req.body);

	// The posted information from the front-end
	var queryString = req.body.queryString;
	// Current time this occurred
	var time = moment().format('MMMM Do YYYY, h:mm:ss a');



	// setup the new user
	var newQuery = new Query({
		queryString: queryString
	});

	// save the user to the database
	newQuery.save(function(err, savedUser, numberAffected) {

		if (err) {
			res.status(500).json({
				'message': 'Database error trying to sign up.  Please contact support@yourproject.com.'
			});
		}

		// Log success and send the filtered user back
		console.log('Successfully created new query: ' + queryString);

		res.status(201).json({
			'message': 'Successfully created new query'
		});

	});



});

// export the router for usage in our server/router/index.js
module.exports = router;