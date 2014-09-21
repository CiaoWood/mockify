(function () {
  'use strict';

  angular.module('procKr.alert', [
    'procKr.service.webSocket'
  ])

  /**
   * Handle alerts sent by websockets.
   */
  .controller('AlertCtrl', ['$scope', 'webSocketService',
    function ($scope, webSocket) {
      $scope.showAlert = false;

      var saveDataToScope = function (data) {
        $scope.type = data.type || 'danger';
        $scope.strong = data.strong;
        $scope.message = data.message;
        $scope.showAlert = true;
      };

      $scope.$root.$on('alert', function (e, data) {
        saveDataToScope(data);
      });

      $scope.$root.$on('hideAlert', function () {
        $scope.showAlert = false;
      });

      webSocket.on('alert', function (data) {
        $scope.$apply(function () {
          saveDataToScope(data);
        });
      });
    }
  ]);
})();
