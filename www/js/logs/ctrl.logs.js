(function () {
  'use strict';

  angular.module('mockify.log.controller.log', [
    'mockify.common.service.webSocket',
    'mockify.log.directive.updateScroll',

    'perfect_scrollbar'
  ])

  .controller('LogsCtrl', ['$scope', 'webSocketService',
    function ($scope, webSocket) {
      $scope.logs = [];

      _.forEach(['proxy', 'mock'], function (eventSource) {
        webSocket.on(eventSource + 'Out', function (logData) {
          $scope.$apply(function () {
            $scope.logs.push(logData);
          });
        });

        webSocket.on(eventSource + 'Error', function (logData) {
          $scope.$apply(function () {
            $scope.logs.push(logData);
          });
        });
      });
    }
  ]);
})();
