(function () {
  'use strict';

  angular.module('mockify', [
    'ui.router',

    'templates',

    'mockify.alert.controller.alert',
    'mockify.dashboard.controller.dashboard',

    'mockify.common.directive.spinner'
  ])

  .config(['$urlRouterProvider', '$stateProvider',
    function ($urlRouterProvider, $stateProvider) {
      $urlRouterProvider.otherwise('/dashboard/targets');

      $stateProvider
        .state('app', {
          url: '/',
          abstract: true,
          views: {
            alert: {
              templateUrl: 'alert.html',
              controller: 'AlertCtrl'
            },
            header: {
              templateUrl: 'header.html'
            },
            layout: {
              templateUrl: 'dashboard.html',
              controller: 'DashboardCtrl'
            }
          }
        });
    }
  ])

  .run(['$rootScope', '$state', function ($rootScope, $state) {
    // display route state for debug
    $rootScope.$on('$stateChangeSuccess', function (e, current) {
      console.log('Current state:', current.name);
    });

    $rootScope.$state = $state;
  }]);
})();
