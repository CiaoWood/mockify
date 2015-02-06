(function () {
  'use strict';

  angular.module('mockify.dashboard.controller.dashboard', [
    'mockify.target.controller.target',
    'mockify.record.controller.record',
    'mockify.response.controller.response',
    'mockify.log.controller.log',
    'mockify.dashboard.service.searchHistory'
  ])

  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('app.dashboard', {
        url: 'dashboard',
        abstract: true,
        views: {
          'navContainer@app': {
            templateUrl: 'nav.html'
          },
          'logsContainer@app': {
            templateUrl: 'logs.html',
            controller: 'LogsCtrl'
          }
        }
      });
  }])

  .controller('DashboardCtrl', [
    '$scope',
    '$state',
    'localStorageService',
    'searchHistoryFactory',

    function DashboardCtrl(
      $scope,
      $state,
      localStorageService,
      searchHistoryFactory
    ) {
      if ($scope.responses === undefined) {
        $scope.responses = localStorageService.get('responses');
      }

      // init search box
      $scope.search = {value: ''};
      $scope.searchObjects = {};

      /**
       * Return the Search instance from the searchHistoryFactory service
       * in charge to eval the search value in order to filter responses or
       * records.
       */
      $scope.getSearchObject = function (stateName_) {
        var stateName = stateName_ || $scope.$state.$current.name,
            // records or responses
            searchIndex = stateName.split(/\./).slice(0, 3).pop();

        if (!$scope.searchObjects[searchIndex]) {
          $scope.searchObjects[searchIndex] = searchHistoryFactory.new();
        }

        return $scope.searchObjects[searchIndex];
      };

      /**
       * Update the value of the search in the service.
       */
      $scope.updateSearchValue = function () {
        $scope.getSearchObject().value($scope.search.value);
      };

      /**
       * Clear the search and update the value in the service.
       */
      $scope.clearSearch = function () {
        $scope.search.value = '';
        $scope.updateSearchValue();
      };

      /**
       * Filter records or responses according to the search value.
       */
      $scope.filterObjects = function (objects) {
        // return the evaluation and if true, keep the record
        try {
          var bool = $scope.getSearchObject()
            .eval_(_.publicProperties(objects));
          $scope.search.error = false;
          return bool;
        } catch (err) {
          $scope.search.error = true;
          return false;
        }
      };
    }
  ]);
})();
