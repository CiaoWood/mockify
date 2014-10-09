(function () {
  'use strict';

  angular.module('mockify.alert', [
    'mockify.service.webSocket'
  ])

  /**
   * Handle alerts.
   */
  .controller('AlertCtrl', ['$rootScope', '$scope', 'webSocketService',
    function ($rootScope, $scope, webSocket) {
      $scope.showAlert = false;

      var saveDataToScope = function (data) {
        $scope.type = data.type || 'danger';
        $scope.strong = data.strong;
        $scope.message = data.message;
        $scope.showAlert = true;
      };

      webSocket.on('alertError', function (data) {
        $scope.$apply(function () {
          saveDataToScope(data);
        });
      });

      $rootScope.$on('alertError', function (e, data) {
        saveDataToScope(data);
      });

      $rootScope.$on('hideAlert', function () {
        $scope.showAlert = false;
      });

      /**
       * Shortcut global method to push an error alert.
       * @param  {String|Object} data
       */
      $rootScope.alertError = function (data) {
        if (_.isString(data)) {
          data = {message: data};
        }

        $rootScope.$broadcast('alertError', data);
      };

      /**
       * Shortcut global method to push an info alert.
       * @param  {String|Object} data
       */
      $rootScope.alertInfo = function (data) {
        if (_.isString(data)) {
          data = {message: data};
        }

        data.type = 'info';

        $rootScope.$broadcast('alertError', data);
      };
    }
  ]);
})();
