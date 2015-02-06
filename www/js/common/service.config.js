(function () {
  'use strict';

  angular.module('mockify.common.service.config', [
  ])

  .factory('configFactory', ['$window', function ($window) {
    return $window.config;
  }]);
})();
