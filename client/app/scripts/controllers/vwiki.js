'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:VwikiCtrl
 * @description
 * # VwikiCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('VwikiCtrl', function ($scope,$routeParams,$http) {
    
    var request = $http.get('/resources/' + $routeParams.label);

		request.success(function(data) {

			
			$scope.res = data;
			//console.log($scope.res.label);

		});

  });
