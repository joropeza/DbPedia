'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:ListCtrl
 * @description
 * # ListCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('ListCtrl', function ($scope, $http) {
    
		var request = $http.get('/resources');

		request.success(function(data) {

			console.log(data);
			$scope.resources = data;

		});

		request.error(function(data) {
			console.log(data.msg);
		});
  });
