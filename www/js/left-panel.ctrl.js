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
  .controller('LeftPanelCtrl', [
    '$scope',
    '$state',
    'localStorageService',

    function (
      $scope,
      $state,
      localStorageService
    ) {
      if ($scope.responses === undefined) {
        $scope.responses = localStorageService.get('responses');
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
    '$scope',
    'webSocketService',
    'proxyResponseFactory',
    'mockResponseFactory',
    'localStorageService',

    function (
      $scope,
      webSocket,
      ProxyResponse,
      MockResponse,
      localStorageService
    ) {
      /**
       * Insert the details of a record in the list of records.
       * @param  {Response} response    the clicked response
       * @param  {Number} index         position to insert the details
       */
      $scope.toggleResponseDetails = function (response, index) {
        console.log(response, index);

        // record.opened = !record.opened;

        // // save the index in the result
        // record.index = index;

        // if (record.opened) {
        //   // clone and flag the new record to display a verbose row
        //   var clonedRecord = _.cloneDeep(record);
        //   var jsonValues =
        //     ['_body', '_reqHeaders', '_resHeaders', '_parameters'];

        //   delete clonedRecord.opened;
        //   delete clonedRecord.index;

        //   clonedRecord.details = {
        //     // keys: _.keys(_.publicProperties(clonedRecord)),
        //     keys: _.keys(clonedRecord),
        //     values: _.map(_.values(clonedRecord), function (value) {
        //       var ret = value;
        //       if (_.isObject(value)) {
        //         ret = JSON.stringify(value, null, 2);
        //       }
        //       return ret;
        //     }),
        //     jsonValues: _.map(_.keys(clonedRecord), function (k) {
        //       return _.contains(jsonValues, k);
        //     })
        //   };

        //   // insert the details
        //   $scope.records.splice(record.index + 1, 0, clonedRecord);
        // } else {
        //   // remove the details
        //   $scope.records.splice(record.index + 1, 1);
        // }
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
            localStorageService.save('responses',
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
        } else {
          // remove the details
          $scope.records.splice(record.index + 1, 1);
        }
      };

      /**
       * Remove a record.
       */
      $scope.removeRecord = function (record) {
        webSocket.emit('removeRecord', record);
      };

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
