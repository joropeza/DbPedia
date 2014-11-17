'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:QueryCtrl
 * @description
 * # QueryCtrl
 * Controller of the clientApp
 */
angular.module('clientApp') // make sure this is set to whatever it is in your client/scripts/app.js
.controller('QueryCtrl', function($scope, $http) { // note the added $http depedency



	// This is our method that will post to our server.
	$scope.runQuery = function() {

		// Just so we can confirm that the bindings are working
		console.log($scope.queryString);

		var mydata = { "searchTerm": $scope.queryString};


		// Make the request to the server ... which doesn't exist just yet
		var request = $http.post('/query', mydata);

		request.success(function(data) {
			// our json response is recognized as
			// the data parameter here. See? Our msg
			// value is right there!
			console.log(data.msg);
		});

		request.error(function(data) {
			console.log(data.msg);
		});

	};

});