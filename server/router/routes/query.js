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
var Resources = db.resources;

var rS = require('../../services/resourceService');

String.prototype.replaceAll = function(str1, str2, ignore) 
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
} 


function influenceTree(queryString, callback) {

	getInfluencedBy(queryString, function(array) {

		//iterate the influences, offering to add them to the DB, and then getting their own influencedBys

		var chunk = 2;
		var index = 0;

		function doChunk() {
			var cnt = chunk;
			while (cnt-- && index < array.length) {
				console.log(array[index].label.value);
				rS.wikiResource(array[index].label.value.replaceAll(" ","_"), function(entity) {
					//influenceTree(array[index].label.value.replaceAll(" ","_"), function(stuff) {});
				});
				++index;
			}
			if (index < array.length) {
				// set Timeout for async iteration
				setTimeout(doChunk, 1);
			}
		}
		doChunk();



	//	for (var i = 0, item; item = returnValue[i]; i++) {

	//		console.log(item.label.value);
	//		wikiResource(item.label.value.replace(" ","_"), function(entity) {

	//		});

		


	});
}

function getInfluencedBy(queryString, callback) {

	var query = "select ?label ?wikiId ?influencedBy where { ?x owl:sameAs? dbpedia:" + queryString + " . ?x dbpedia-owl:influencedBy ?influencedBy . ?influencedBy rdfs:label ?label . ?influencedBy dbpedia-owl:wikiPageID ?wikiId . FILTER langMatches(lang(?label), 'en')}";

	rS.qDbPedia(query, function(dbpediaEntry) {

		console.log(dbpediaEntry);
		callback(dbpediaEntry);

	});

}










// The POST /signup route
router.post('/', function(req, res) {

	console.log(req.body);

	// The posted information from the front-end
	var queryString = req.body.queryString;
	var param = decodeURIComponent(queryString);
	param = param.replaceAll(" ", "_");
	// Current time this occurred
	var time = moment().format('MMMM Do YYYY, h:mm:ss a');


	rS.wikiResource(param, function(dbpediaResource) {

		console.log(dbpediaResource);

		var returnObject = {};

		var query = "PREFIX rsc: <http://dbpedia.org/resource/> PREFIX dbpedia-owl: <http://dbpedia.org/ontology/> SELECT ?person1 ?birthplace ?birthyear ?deathyear ?lat1 ?long1 ?thumbnail ?wikiId ?label ?comment WHERE { ?person1 dbpedia-owl:influencedBy rsc:" + param + " . ?person1 rdfs:label ?label . filter(langMatches(lang(?label),'EN')) . ?person1 rdfs:comment ?comment . filter(langMatches(lang(?comment),'EN')) . ?person1 dbpedia-owl:birthYear ?birthyear . optional { ?person1 dbpedia-owl:deathYear ?deathyear} . ?person1 dbpedia-owl:thumbnail ?thumbnail . ?person1 dbpedia-owl:wikiPageID ?wikiId . ?person1 dbpedia-owl:birthPlace ?birthplace . ?birthplace a dbpedia-owl:Settlement . optional { ?birthplace geo:lat ?lat1 . ?birthplace geo:long ?long1 .}}";

		rS.qDbPedia(query, function(returnValue) {

			returnObject = returnValue;


			//added to force an artificial iteration of influenced
			influenceTree(param, function(returnValue) {

				return res.status(201).send(returnObject);

				console.log('why am I here?');

			});



		});

	});

});

// export the router for usage in our server/router/index.js
module.exports = router;