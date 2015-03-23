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
  ])

  /**
   * Show or hide the logs panel when hitting the 'square' key
   * and listening on events to open/close the panel.
   */
  .directive('toggleConsole', ['$rootScope', function ($rootScope) {
    return {
      restrict: 'A',
      link: function (scope, el) {
        var $ = angular.element,
            $panel = $(el);

        $rootScope.$on('openLogs', function () {
          $panel.addClass('opened');
        });

        $rootScope.$on('closeLogs', function () {
          $panel.removeClass('opened');
        });

        $(document).keydown(function (e) {
          if (e.which === 192) { // square key
            $panel.toggleClass('opened');
          }
        });
      }
    };
  }])

  /**
   * Broadcast an event to close the panel when clicking on the element.
   */
  .directive('closeLogs', ['$rootScope', function ($rootScope) {
    return {
      restrict: 'A',
      link: function (scope, el) {
        angular.element(el).click(function () {
          $rootScope.$broadcast('closeLogs');
        });
      }
    };
  }])

  /**
   * Broadcast an event to open the panel when hovering the element.
   */
  .directive('openLogs', ['$rootScope', function ($rootScope) {
    return {
      restrict: 'A',
      link: function (scope, el) {
        angular.element(el).hover(function () {
          $rootScope.$broadcast('openLogs');
        });
      }
    };
  }]);
})();
