(function () {
  'use strict';

  angular.module('mockify.leftPanel', [
    'mockify.service.webSocket',
    'mockify.entity.response',
    'mockify.entity.record',
    'truncate'
  ])

  .config(function ($urlRouterProvider, $stateProvider) {
    $stateProvider
      .state('app.dashboard.responses', {
        url: '/responses',
        views: {
          // ui-view="tabContent" of left-panel.html
          'tabContent@app.dashboard': {
            templateUrl: 'responses.html',
            controller: 'ResponsesCtrl'
          }
        }
      })
      .state('app.dashboard.records', {
        url: '/records',
        views: {
          // ui-view="tabContent" of left-panel.html
          'tabContent@app.dashboard': {
            templateUrl: 'records.html',
            controller: 'RecordsCtrl'
          }
        }
      });
  })

  /**
   * Handle the left panel.
   */
  .controller('LeftPanelCtrl', ['$scope', '$state',
    function ($scope, $state) {
      if ($scope.logs === undefined) {
        $scope.logs = [];
      }

      // init the search value
      $scope.search = { value: undefined };

      $scope.selectTab = function (tab) {
        $state.go(tab, {});
      };
    }
  ])

  /**
   * Handle responses from child processes.
   */
  .controller('ResponsesCtrl', [
    '$scope', 'webSocketService', 'proxyResponseFactory',
    function ($scope, webSocket, ProxyResponse) {
      _.forEach(['proxy', 'mock'], function (eventSource) {
        webSocket.on(eventSource + 'Response', function (logData) {
          var log = logData;
          if (logData.source === 'proxy') {
            log = new ProxyResponse(logData.message);
          }

          $scope.$apply(function () {
            $scope.logs.push(log);
          });
        });
      });
    }
  ])

  /**
   * Handle records in database.
   */
  .controller('RecordsCtrl', [
    '$scope', 'webSocketService', 'recordFactory',
    function ($scope, webSocket, Record) {
      var listRecords = function (data) {
        var records = _.map(data.records, function (record) {
          return new Record(record);
        });

        $scope.$apply(function () {
          $scope.records = records;
        });
      };

      webSocket.emit('listRecords');
      webSocket.on('listRecords', listRecords);

      $scope.listRecords = function () {
        webSocket.emit('listRecords');
      };

      $scope.removeRecord = function (recordId) {
        webSocket.emit('removeRecord', {id: recordId});
      };
    }
  ])

  /**
   * When clicking on a tag, save its value in the search box.
   */
  .directive('setToSearchBox', [function () {
    return {
      restrict: 'A',
      controller: ['$scope', function ($scope) {
        $scope.click = function (value) {
          $scope.$apply(function () {
            $scope.search.value = value;
          });
        };
      }],
      link: function (scope, element) {
        element.on('click', function () {
          scope.click(angular.element(this).html());
        });
      }
    };
  }]);
})();
