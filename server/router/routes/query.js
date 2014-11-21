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
var Resources = db.resources;


function wikiResource(queryString, callback) {

	//lookup resource with that label

	console.log('Looking for resource ' + queryString);

	Resources.findOne({
		'label': queryString
	}, function(err, resource) {

		if (err) {
			console.log(err);
			callback(err);
		}

		//if found, return the resource
		if (resource) {
			console.log("found resource!");
			callback(resource);
		}

		if (!resource) {
			console.log("did not find resource, adding!");

			var query = "select ?label ?comment ?birthDate ?deathDate ?wikiId ?description where { ?x owl:sameAs? dbpedia:" + queryString + " . ?x rdfs:label ?label . ?x rdfs:comment ?comment . ?x dbpedia-owl:wikiPageID ?wikiId . optional { ?x dbpprop:shortDescription ?description } . ?x dbpedia-owl:birthDate ?birthDate . optional { ?x dbpedia-owl:deathDate ?deathDate } . FILTER langMatches(lang(?comment), 'en') FILTER langMatches(lang(?label), 'en')}";

			qDbPedia(query, function(dbpediaEntry) {


				console.log(dbpediaEntry);

				if (dbpediaEntry.length > 0) {

					var bD;
					if (dbpediaEntry[0].birthDate != null) {

						bD = moment(dbpediaEntry[0].birthDate.value, "YYYY-MM-DD");

						//test to see if this is a BC date or not
						if (dbpediaEntry[0].birthDate.value.charAt(0) === '-') {
							var date = new Date();
							console.log("BC DATE FOUND!");
							date.setYear(0 - moment(bD).year());
							date.setMonth(1);
							date.setDate(1);
							bD = date;
						}
					}

					var dD;

					if (dbpediaEntry[0].deathDate != null) {
						dD = moment(dbpediaEntry[0].deathDate.value, "YYYY-MM-DD");

						//test to see if this is a BC date or not
						if (dbpediaEntry[0].deathDate.value.charAt(0) === '-') {
							var date = new Date();
							console.log("BC DATE FOUND!");
							date.setYear(0 - moment(dD).year());
							date.setMonth(1);
							date.setDate(1);
							dD = date;
						}
					}

					var newResource = new Resources({
						label: dbpediaEntry[0].label.value,
						type: 'Person',
						comment: dbpediaEntry[0].comment.value,
						description: dbpediaEntry[0].description.value,
						birthDate: bD,
						deathDate: dD,
						_id: parseInt(dbpediaEntry[0].wikiId.value)
					});

					console.log(newResource);


					newResource.save(function(err, savedResource, numberAffected) {

						console.log(err);

						callback(savedResource);

					});

				} else {

					//dbPedia entry not found!
					callback(null);

				}

			});

		}

		//if not found, SPARQL for the resource, then the return the resource


	});


}

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
	var param = decodeURIComponent(queryString);
	param = param.replace(" ", "_");
	// Current time this occurred
	var time = moment().format('MMMM Do YYYY, h:mm:ss a');


	wikiResource(param, function(dbpediaResource) {

		console.log(dbpediaResource);

		var returnObject = {};

		var query = "PREFIX rsc: <http://dbpedia.org/resource/> PREFIX dbpedia-owl: <http://dbpedia.org/ontology/> SELECT ?person1 ?birthplace ?birthyear ?deathyear ?lat1 ?long1 ?thumbnail ?wikiId ?label ?comment WHERE { ?person1 dbpedia-owl:influencedBy rsc:" + param + " . ?person1 rdfs:label ?label . filter(langMatches(lang(?label),'EN')) . ?person1 rdfs:comment ?comment . filter(langMatches(lang(?comment),'EN')) . ?person1 dbpedia-owl:birthYear ?birthyear . optional { ?person1 dbpedia-owl:deathYear ?deathyear} . ?person1 dbpedia-owl:thumbnail ?thumbnail . ?person1 dbpedia-owl:wikiPageID ?wikiId . ?person1 dbpedia-owl:birthPlace ?birthplace . ?birthplace a dbpedia-owl:Settlement . optional { ?birthplace geo:lat ?lat1 . ?birthplace geo:long ?long1 .}}";

		qDbPedia(query, function(returnValue) {

			returnObject = returnValue;

			return res.status(201).send(
				returnObject
			);

			console.log('why am I here?');

		});

	});

});

// export the router for usage in our server/router/index.js
module.exports = router;