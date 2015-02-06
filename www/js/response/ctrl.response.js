(function () {
  'use strict';

  angular.module('mockify.response.controller.response', [
    'mockify.common.service.webSocket',
    'mockify.record.entity.record',
    'mockify.response.entity.response',
    'mockify.common.service.localStorage'
  ])

  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('app.dashboard.responses', {
        url: '/responses',
        views: {
          'primaryContainer@app': {
            templateUrl: 'responses.html',
            controller: 'ResponseCtrl'
          }
        }
      });
  }])

  /**
   * Handle responses from child processes.
   */
  .controller('ResponseCtrl', [
    '$scope',
    '$state',
    'webSocketService',
    'proxyResponseFactory',
    'mockResponseFactory',
    'localStorageService',

    function ResponseCtrl(
      $scope,
      $state,
      webSocket,
      ProxyResponse,
      MockResponse,
      localStorageService
    ) {
      // init the search box with object searchs saved in the scope parent
      $scope.search.value = $scope.getSearchObject().value();

      var LOCAL_STORAGE_KEY = 'responses';

      /**
       * Redirect to the record edition.
       */
      $scope.openRecordEdition = function (recordId) {
        $state.go('app.dashboard.records.edit', {id: recordId});
      };

      /**
       * Clean history saved in local storage.
       */
      $scope.clearHistory = function () {
        localStorageService.delete(LOCAL_STORAGE_KEY);
        $scope.responses.length = 0;
      };

      /**
       * Listen websockets events and update responses on change.
       */
      _.forEach(['proxy', 'mock'], function (eventSource) {
        webSocket.on(eventSource + 'Response', function (resData) {
          var response = resData;

          if (resData.source === 'proxy') {
            response = new ProxyResponse(resData.message);
          }

          if (resData.source === 'mock') {
            response = new MockResponse(resData.message);
          }

          $scope.$apply(function () {
            $scope.responses.push(response);

            // save last X responses in localStorageService
            var index = _.max([0, $scope.responses.length - 10]);
            localStorageService.save(LOCAL_STORAGE_KEY,
              $scope.responses.slice(index));
          });
        });
      });
    }
  ]);

})();
