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
      })
      .state('app.dashboard.records.edit', {
        url: '/:id/edit',
        views: {
          // ui-view="recordEdition" of records.html
          'recordEdition@app.dashboard.records': {
            templateUrl: 'record-edition.html',
            controller: 'RecordEditionCtrl'
          }
        }
      });
  })

  /**
   * Handle the left panel.
   */
  .controller('LeftPanelCtrl', [
    '$scope',
    '$state',
    'localStorageService',

    function LeftPanelCtrl(
      $scope,
      $state,
      localStorageService
    ) {
      if ($scope.responses === undefined) {
        $scope.responses = localStorageService.get('responses');
      }

      // init the search value
      $scope.search = { value: undefined };

      $scope.selectTab = function (stateName) {
        $state.go(stateName);
      };
    }
  ])

  /**
   * Handle responses from child processes.
   */
  .controller('ResponsesCtrl', [
    '$scope',
    '$state',
    'webSocketService',
    'proxyResponseFactory',
    'mockResponseFactory',
    'localStorageService',

    function ResponsesCtrl(
      $scope,
      $state,
      webSocket,
      ProxyResponse,
      MockResponse,
      localStorageService
    ) {
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
  ])

  /**
   * Handle records in database.
   */
  .controller('RecordsCtrl', [
    '$scope',
    '$state',
    'webSocketService',
    'recordFactory',

    function RecordsCtrl(
      $scope,
      $state,
      webSocket,
      Record
    ) {

      /**
       * Update the list of records.
       */
      var listRecords = function (data) {
        var records = _.map(data.records, function (record) {
          return new Record(record);
        });

        $scope.$apply(function () {
          $scope.records = records;

          // one records have been fetched, check if a recordId is in state
          // to open the record edition
          if (_.has($state.params, 'id')) {
            var id = parseInt($state.params.id),
                record = _($scope.records).where({_id: id}).first(),
                index = _.findIndex($scope.records, {_id: id});

            $scope.toggleRecordDetails(record, index);
          }
        });
      };

      // send a 'listRecords' event to receive response from the server
      webSocket.emit('listRecords');
      webSocket.on('listRecords', listRecords);

      /**
       * List all records.
       */
      $scope.listRecords = function () {
        webSocket.emit('listRecords');
      };

      /**
       * Insert the details of a record in the list of records.
       * @param  {Record} record    the clicked record
       * @param  {Number} index     position to insert the details
       */
      $scope.toggleRecordDetails = function (record, index) {
        record.opened = !record.opened;

        // save the index in the result
        record.index = index;

        if (record.opened) {
          // clone and flag the new record to display a verbose row
          var clonedRecord = _.cloneDeep(record);
          var jsonValues =
            ['_body', '_reqHeaders', '_resHeaders', '_parameters'];

          delete clonedRecord.opened;
          delete clonedRecord.index;

          clonedRecord.details = {
            // keys: _.keys(_.publicProperties(clonedRecord)),
            keys: _.keys(clonedRecord),
            values: _.map(_.values(clonedRecord), function (value) {
              var ret = value;
              if (_.isObject(value)) {
                ret = JSON.stringify(value, null, 2);
              }
              return ret;
            }),
            jsonValues: _.map(_.keys(clonedRecord), function (k) {
              return _.contains(jsonValues, k);
            })
          };

          // insert the details
          $scope.records.splice(record.index + 1, 0, clonedRecord);
          $state.go('app.dashboard.records.edit', {id: record._id});

        } else {
          // remove the details
          $scope.records.splice(record.index + 1, 1);
          $state.go('app.dashboard.records');
        }
      };

      /**
       * Remove a record.
       */
      $scope.removeRecord = function (record) {
        webSocket.emit('removeRecord', record);
      };
    }
  ])

  /**
   * Handle records in database.
   */
  .controller('RecordEditionCtrl', [
    '$scope',
    'webSocketService',

    function RecordEditionCtrl(
      $scope,
      webSocket
    ) {
      /**
       * Edit the record and 'close' the details.
       */
      $scope.validRecordEdition = function (clonedRecord, index) {
        var error = false;

        // convert JSON to object
        _.map(clonedRecord.details.keys, function (key, i) {
          if (clonedRecord.details.jsonValues[i]) {
            try {
              JSON.parse(clonedRecord.details.values[i]);
            }
            catch (err) {
              error = true;
              $scope.alertError(
                'The value of the ' + key +
                ' property in not a valid JSON structure.');
            }
          }
        });

        if (!error) {
          // we want to collapse the previous record
          index--;

          var properties = {};
          _.map(clonedRecord.details.keys, function (keys, i) {
            properties[keys] = clonedRecord.details.values[i];
          });

          webSocket.emit('updateRecord', _.publicProperties(properties));
          webSocket.on('updateRecord', function (msgLog) {
            $scope.alertInfo(msgLog);
            $scope.listRecords();
          });

          $scope.toggleRecordDetails($scope.records[index], index);
        }
      };
    }
  ])

  /**
   * When clicking on a tag, save its value in the search box.
   */
  .directive('setToSearchBox', [function setToSearchBox() {
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
