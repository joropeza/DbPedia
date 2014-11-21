'use strict';

/**
 * @ngdoc directive
 * @name clientApp.directive:timeline
 * @description
 * # timeline
 */
angular.module('clientApp')
	.directive('timeline', function() {
		return {
			template: '<div id="timelineChart"></div>Hello Lover',
			restrict: 'A',
			scope: {
				ourdata: '='
			},
			link: function(scope, element, attrs) {
				scope.$watch('ourdata', function(chartdata) {

					if (chartdata != null) {

					console.log('ourdata', chartdata);
					var width = 500;
					var currentDate = new Date();

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
					var svg = d3.select('#timelineChart').append('svg').attr('width', width)
					.datum(chartdata).call(chart);

				}

				});
			}
		};
	});