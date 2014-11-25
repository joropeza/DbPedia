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

router.get('/', function(req, res) {

	Resources.find({}, function(err, reqResources) {

    res.send(reqResources);  
    
  });

});

router.get('/:label/related/:verb', function(req, res) {

	var label = req.param('label')
    var verb = req.param('verb')

	console.log("Fetching " + verb + " for " + label);

	rS.buildInfluencedByTree(label, verb, function(reqResources) {

    	if (reqResources)
    	  res.send(reqResources);  
    	else {
    	   //resource not found... so let's see if it exists in the dbpedia
    	   console.log(reqResources);
           res.send(null);

    	 }
  });  

});



router.get('/:label', function(req, res) {

	var label = req.param('label')

	console.log("Fetching " + label);

	rS.wikiResource(label, function(reqResources) {

    	if (reqResources)
    	  res.send(reqResources);  
    	else {
    	   //resource not found... so let's see if it exists in the dbpedia
    	   console.log(reqResources);

    	 }
  });


});

module.exports = router;