/**
 * This handles the signing up of users
 */
var express = require('express');
var router = express.Router();
var moment = require('moment');
var _ = require('underscore');
var color = require('cli-color');

var SparqlClient = require('sparql-client');
var util = require('util');
var endpoint = 'http://dbpedia.org/sparql';

var db = require('../../database');
var Query = db.query;

function qDbPedia(query, callback) {

	var client = new SparqlClient(endpoint);
		console.log("Query to " + endpoint);
		console.log("Query: " + query);
		client.query(query)
			//.bind('city', 'db:Chicago')
			//.bind('city', 'db:Tokyo')
			//.bind('city', 'db:Casablanca')
			//.bind('city', '<http://dbpedia.org/resource/' + queryString + '>')
			.execute(function(error, results) {
				
				 callback(results.results.bindings);
				
			});
}


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


		// Get the leaderName(s) of the given citys
		// if you do not bind any city, it returns 10 random leaderNames
		//var query = "SELECT * FROM <http://dbpedia.org> WHERE { ?city <http://dbpedia.org/property/leaderName> ?leaderName } LIMIT 10";

		var returnObject = {};


		var param = decodeURIComponent(queryString);
		param = param.replace(" ","_");

		var query = "PREFIX rsc: <http://dbpedia.org/resource/> PREFIX dbpedia-owl: <http://dbpedia.org/ontology/> SELECT ?person1 ?birthplace ?birthyear ?deathyear ?lat1 ?long1 ?thumbnail ?wikiId ?label ?comment WHERE { ?person1 dbpedia-owl:influencedBy rsc:" + param + " . ?person1 rdfs:label ?label . filter(langMatches(lang(?label),'EN')) . ?person1 rdfs:comment ?comment . filter(langMatches(lang(?comment),'EN')) . ?person1 dbpedia-owl:birthYear ?birthyear . optional { ?person1 dbpedia-owl:deathYear ?deathyear} . ?person1 dbpedia-owl:thumbnail ?thumbnail . ?person1 dbpedia-owl:wikiPageID ?wikiId . ?person1 dbpedia-owl:birthPlace ?birthplace . ?birthplace a dbpedia-owl:Settlement . optional { ?birthplace geo:lat ?lat1 . ?birthplace geo:long ?long1 .}}";

		qDbPedia(query,function(returnValue) {

			returnObject = returnValue;

			res.status(201).send(
				returnObject
			);
		});



	});



});

// export the router for usage in our server/router/index.js
module.exports = router;