'use strict';

describe('Controller: VwikiCtrl', function () {

  // load the controller's module
  beforeEach(module('clientApp'));

  var VwikiCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    VwikiCtrl = $controller('VwikiCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
