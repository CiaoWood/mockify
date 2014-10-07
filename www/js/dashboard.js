(function () {
  'use strict';

  angular.module('mockify.dashboard', [
    'mockify.process',
    'mockify.leftPanel',
    'mockify.logs'
  ])

  .config(function ($urlRouterProvider, $stateProvider) {
    $stateProvider
      .state('app.dashboard', {
        url: 'dashboard',
        views: {
          primaryContainer: {
            templateUrl: 'left-panel.html',
            controller: 'LeftPanelCtrl'
          },
          secondaryContainer: {
            templateUrl: 'targets.html',
            controller: 'TargetCtrl'
          },
          logsContainer: {
            templateUrl: 'logs.html',
            controller: 'LogsCtrl'
          }
        }
      });
  });
})();
