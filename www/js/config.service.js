(function () {
  'use strict';

  angular.module('mockify.service.config', [
  ])

  .factory('configFactory', ['$window', function ($window) {
    return $window.config;
  }]);
})();
