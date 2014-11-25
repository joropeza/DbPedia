var moment = require('moment');
var _ = require('underscore');
var color = require('cli-color');

var SparqlClient = require('sparql-client');
var util = require('util');
var endpoint = 'http://dbpedia.org/sparql';

var db = require('../database');
var Query = db.query;
var Resources = db.resources;

var mongoose = require('mongoose');

String.prototype.replaceAll = function(str1, str2, ignore) {
	return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")), (typeof(str2) == "string") ? str2.replace(/\$/g, "$$$$") : str2);
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
			try {
				callback(results.results.bindings);
			} catch (err) {
				callback(null);
			}
		});
}

exports.qDbPedia = function(query, callback) {

	var client = new SparqlClient(endpoint);
	console.log("Query to " + endpoint);
	console.log("Query: " + query);
	client.query(query)
		//.bind('city', 'db:Chicago')
		//.bind('city', 'db:Tokyo')
		//.bind('city', 'db:Casablanca')
		//.bind('city', '<http://dbpedia.org/resource/' + queryString + '>')
		.execute(function(error, results) {
			try {
				callback(results.results.bindings);
			} catch (err) {
				callback(null);
			}
		});
};
function buildInfluencedByTree(queryString, verb, callback) {

	if (verb == "influencedBy") {verb = "dbpedia-owl:influencedBy";}
	if (verb == "influenced") {verb = "dbpedia-owl:influenced";}


	Resources.findOne({
		'label': queryString
	}, function(err, masterEntity) {

		console.log("FOUND: " + masterEntity.label);

		getRelatedTo(queryString.replaceAll(" ", "_"), verb, function(array) {

			//iterate the influences, offering to add them to the DB, and then getting their own influencedBys

			console.log("Influeces: " + array);

			var chunk = 1;
			var index = 0;
			var dunzo = 0;


			function doChunk() {
				console.log("starting chunk");
				var cnt = chunk;
				while (cnt-- && index < array.length) {
					console.log(array[index].label.value);
					wikiResource(array[index].label.value, function(entity) {
						if (entity != null) {
						
						var newR = {label: entity.label, wikiId: entity._id, birthDate: entity.birthDate, deathDate: entity.deathDate };
						
						console.log("Adding: " + newR.label);

						if (verb == "dbpedia-owl:influencedBy")
							masterEntity.influencedBy.push(newR);
						if (verb == "dbpedia-owl:influenced")
							masterEntity.influenced.push(newR);
						

						masterEntity.save();
						}

						dunzo++;
						console.log("Completed " + dunzo + " of " + array.length + " loops.");
						if (dunzo==array.length)
							if (verb == "dbpedia-owl:influencedBy")
								callback(masterEntity.influencedBy);
							if (verb == "dbpedia-owl:influenced")
								callback(masterEntity.influenced);
							

					});
					++index;
				}
				if (index < array.length) {
					// set Timeout for async iteration
					setTimeout(doChunk, 1000);
				}
			}
			doChunk();

			console.log("HERE I AM BABY");
			//callback(null);

		});

	});
};

function getRelatedTo(queryString, verb, callback) {

	//dbpedia-owl:influencedBy
	var query = "select ?label ?wikiId ?related where { ?x owl:sameAs? dbpedia:" + queryString + " . ?x " + verb + " ?related . ?related rdfs:label ?label . ?related dbpedia-owl:wikiPageID ?wikiId . FILTER langMatches(lang(?label), 'en')}";

	qDbPedia(query, function(dbpediaEntry) {

		callback(dbpediaEntry);

	});

}

function wikiResource(queryString, callback) {

	//lookup resource with that label

	//

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
			queryString = queryString.replaceAll(" ", "_");
			addToCollection(queryString, function(dbpediaEntry) {
				callback(dbpediaEntry);
			});



		}

		//if not found, SPARQL for the resource, then the return the resource


	});


};

function cleanEncode(queryString) {

	queryString = queryString.replace('ø','o');

	return queryString;

}


function addToCollection(queryString, callback) {

	//var query = "select ?label ?comment ?birthDate ?deathDate ?wikiId ?description where { ?x owl:sameAs? dbpedia:" + queryString + " . ?x rdfs:label ?label . ?x rdfs:comment ?comment . ?x dbpedia-owl:wikiPageID ?wikiId . optional { ?x dbpprop:shortDescription ?description } . ?x dbpedia-owl:birthDate ?birthDate . optional { ?x dbpedia-owl:deathDate ?deathDate } . FILTER langMatches(lang(?comment), 'en') FILTER langMatches(lang(?label), 'en')}";

	queryString = cleanEncode(queryString);

	var query = "SELECT * { " +
		"<http://dbpedia.org/resource/" + queryString + "> dbpedia-owl:birthDate ?birthDate . " +
		"optional { <http://dbpedia.org/resource/" + queryString + "> dbpedia-owl:deathDate ?deathDate } . " +
		"<http://dbpedia.org/resource/" + queryString + "> rdfs:label ?label . " +
		"<http://dbpedia.org/resource/" + queryString + "> rdfs:comment ?comment . " +
		"<http://dbpedia.org/resource/" + queryString + "> dbpedia-owl:wikiPageID ?wikiId . " +
		"optional { <http://dbpedia.org/resource/" + queryString + "> dbpprop:shortDescription ?description } . " +
		"FILTER langMatches(lang(?label), 'en') " +
		"FILTER langMatches(lang(?comment), 'en') " +
		"}";

	qDbPedia(query, function(dbpediaEntry) {

		if (dbpediaEntry === null) {
			callback(null);
		}

		try {

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

				//console.log(newResource);


				newResource.save(function(err, savedResource, numberAffected) {

					console.log(err);

					callback(savedResource);

				});

			} else {

				//dbPedia entry not found!
				callback(null);


			}

		} catch (err) {
			console.log("ERROR: " + err);
			callback(null);
		}

	});

}

module.exports = {
	wikiResource: wikiResource,
	buildInfluencedByTree: buildInfluencedByTree
}