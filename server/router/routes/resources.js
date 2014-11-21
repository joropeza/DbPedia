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

router.get('/', function(req, res) {

	Resources.find({}, function(err, reqResources) {

    res.send(reqResources);  
    
  });

});

router.get('/:label', function(req, res) {

	var label = req.param('label')

	Resources.findOne({'label': label}, function(err, reqResources) {

    	res.send(reqResources);  
    
  });

});

module.exports = router;