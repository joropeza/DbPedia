'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:TestingCtrl
 * @description
 * # TestingCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('TestingCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
