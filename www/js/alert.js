(function () {
  'use strict';

  angular.module('mockify.alert', [
    'mockify.service.webSocket'
  ])

  /**
   * Handle alerts.
   */
  .controller('AlertCtrl', [
    '$rootScope', '$scope', '$interval', 'webSocketService',
    function ($rootScope, $scope, $interval, webSocket) {
      $scope.restartLoopHideAlertId;
      $scope.showAlert = false;

      // restart the 'hide loop' when a alert is displayed
      var restartLoopHideAlert = function () {
        $interval.cancel($scope.restartLoopHideAlertId);

        // hide alerts every X seconds
        $scope.restartLoopHideAlertId = $interval(function () {
          $scope.hideAlert();
        }, 10000);
      };

      /**
       * Save data in scope and restart the hide loop.
       */
      var saveAlert = function (data) {
        $scope.type = data.type || 'danger';
        $scope.strong = data.strong;
        $scope.message = data.message;
        $scope.showAlert = true;
        restartLoopHideAlert();
      };

      /**
       * Display alert received via websockets.
       */
      webSocket.on('alert', function (data) {
        $scope.$apply(function () {
          saveAlert(data);
        });
      });

      /**
       * Listen even of the webapp.
       */
      $rootScope.$on('alert', function (e, data) {
        saveAlert(data);
      });

      $rootScope.$on('hideAlert', function () {
        $scope.showAlert = false;
      });

      /**
       * Root method to push an error alert.
       * @param  {String|Object} data
       */
      $rootScope.alertError = function (data) {
        if (_.isString(data)) {
          data = {message: data};
        }

        $rootScope.$broadcast('alert', data);
      };

      /**
       * Root method to push an info alert.
       * @param  {String|Object} data
       */
      $rootScope.alertInfo = function (data) {
        if (_.isString(data)) {
          data = {message: data};
        }

        data.type = 'info';

        $rootScope.$broadcast('alert', data);
      };

      /**
       * Root method to hide the current alert.
       */
      $rootScope.hideAlert = function () {
        $rootScope.$broadcast('hideAlert');
      };
    }
  ]);
})();
