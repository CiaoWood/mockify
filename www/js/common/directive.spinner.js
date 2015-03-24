(function () {
  'use strict';

  angular.module('mockify.common.directive.spinner', [
  ])

  .directive('spinner', [function () {
    return {
      restrict: 'E',
      templateUrl: 'spinner.html'
    };
  }]);
})();
