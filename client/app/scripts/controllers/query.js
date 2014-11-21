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

			if ($scope.queryString == null) {
				$scope.queryString = 'Carl Jung';
			}

			var mydata = {
				'queryString': encodeURIComponent($scope.queryString)
			};

			var request = $http.post('/query', mydata);

			request.success(function(data) {

				console.log(data);

				var labelColorTestData = [];

				var currentDate = new Date();

				for (var i = 0, item; item = data[i]; i++) {
					console.log(item.label.value + ' ' + console.log(item.birthyear.value));
					//$scope.queryResponse = item.leaderName.value;

					var primaryColor = 'blue';
					var birthDate = new Date(item.birthyear.value.substring(0, item.birthyear.value.indexOf('+')));
					
					var deathDate = currentDate;
					try {
						deathDate = new Date(item.deathyear.value.substring(0, item.deathyear.value.indexOf('+')));
					} catch(e) {
						primaryColor = 'green';
					}

					console.log(birthDate.valueOf());

					labelColorTestData.push({label: item.label.value,
					times: [{
						'color': primaryColor,
						'starting_time': birthDate.valueOf(),
						'ending_time': deathDate.valueOf()
					}, ]});

				}

				$scope.chartdata = labelColorTestData;
				
				/*
				var width = 500;

				var chart = d3.timeline()
					.beginning(-3355774400000) // we can optionally add beginning and ending times to speed up rendering a little
					.ending(currentDate.valueOf())

				.stack() // toggles graph stacking
					.margin({
						left: 70,
						right: 30,
						top: 0,
						bottom: 0
					});

				console.log(labelColorTestData);
				

				
				var svg = d3.select('#timeline6').append('svg').attr('width', width)
					.datum(labelColorTestData).call(chart);
				*/

			});

			request.error(function(data) {
				console.log(data);
			});

		};

	});