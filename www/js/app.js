(function () {
  'use strict';

  angular.module('procKr', [
    'ui.router',
    'ui.bootstrap',

    'templates',

    'procKr.dashboard'
  ])

  .config(function ($urlRouterProvider, $stateProvider) {
    $urlRouterProvider.otherwise('/dashboard');

    $stateProvider
      .state('app', {
        url: '/',
        views: {
          error: {
            templateUrl: 'error.html',
            controller: 'ErrorCtrl'
          },
          header: {
            templateUrl: 'header.html'
          },
          layout: {
            templateUrl: '2columns.html'
          }
        }
      });
  })

  .run(['$rootScope', '$state', function ($rootScope, $state) {
    // display route state for debug
    $rootScope.$on('$stateChangeSuccess', function (e, current) {
      console.log('Current state:', current.name);
    });

    // go to the dashboard when loading the app
    $rootScope.$on('$stateChangeStart', function (next, current) {
      if (current.name === 'app') {
        $state.go('app.dashboard');
      }
    });
  }])

  /**
   * Handle errors sent by websockets.
   */
  .controller('ErrorCtrl', ['$scope', 'webSocketService',
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
