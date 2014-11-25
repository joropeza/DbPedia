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
			console.log($scope.res);

			if (data.influencedBy.length == 0) {
				var request2 = $http.get('/resources/' + $routeParams.label + '/related/influencedBy');
				request2.success(function(influencedBys) {
					$scope.influencedBys = influencedBys;
				});

				

			} else {
				$scope.influencedBys = data.influencedBy;
			}

			if (data.influenced.length == 0) {
			
			var request3 = $http.get('/resources/' + $routeParams.label + '/related/influenced');
				request3.success(function(influenceds) {
					$scope.influenceds = influenceds;
				});
			} else {
				$scope.influenceds = data.influenced;
			}

		});

  });
