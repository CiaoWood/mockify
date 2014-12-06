(function () {
  'use strict';

  angular.module('mockify.leftPanel', [
    'mockify.service.webSocket',
    'mockify.entity.response',
    'mockify.entity.record',
    'mockify.service.searchHistory',
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
        })
        .state('app.dashboard.records.add', {
          url: '/add',
          views: {
            // ui-view="tabContent" of left-panel.html
            'tabContent@app.dashboard': {
              templateUrl: 'record-addition.html',
              controller: 'RecordAdditionCtrl'
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
    'searchHistoryFactory',

    function LeftPanelCtrl(
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
       * Go to the add record form.
       */
      $scope.addRecord = function () {
        $state.go('app.dashboard.records.add');
      };

      /**
       * When selecting a tab, update the state and refresh the search box.
       */
      $scope.selectTab = function (stateName) {
        $state.go(stateName);
        $scope.search.value = $scope.getSearchObject(stateName).value();
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

            if (angular.isDefined(record) && angular.isDefined(index)) {
              $scope.toggleRecordDetails(record, index);
            }
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

      var JSON_VALUES =
            ['_body', '_reqHeaders', '_resHeaders', '_parameters'];
      var HIDDEN_KEYS = ['_id', '_uuid', '_targetId', 'opened', 'index'];
      var READONLY_KEYS = ['_dateCreated'];

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

          var keys = _.without.apply(this,
            [].concat([_.keys(clonedRecord)], HIDDEN_KEYS));

          var fields = [];
          _.forEach(keys, function (key) {
            var field = {
              key: key,
              value: (function (value) {
                var ret = value;
                if (_.isObject(value)) {
                  ret = JSON.stringify(value, null, 2);
                }
                return ret;
              })(clonedRecord[key]),
              isJson: _.contains(JSON_VALUES, key),
              isReadOnly: _.contains(READONLY_KEYS, key)
            };

            fields.push(field);
          });

          clonedRecord.details = fields;

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

        // check JSON structures
        _.forEach(clonedRecord.details, function (field) {
          if (field.isJson) {
            try {
              JSON.parse(field.value);
            }
            catch (err) {
              error = true;
              $scope.alertError(
                'The value of the ' + field.key +
                ' property in not a valid JSON structure.');
            }
          }
        });

        if (!error) {
          // we want to collapse the previous record
          index--;

          // make an object with keys and values from fields
          var properties = _.reduce(clonedRecord.details,
            function (result, field) {
              result[field.key] = field.value;
              return result;
            }, {});

          // do not forget to add the id of the record which is hidden in the
          // form
          properties.id = clonedRecord._id;

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

  .controller('RecordAdditionCtrl', ['$scope', function ($scope) {
    console.log('add', $scope);
  }])

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
            $scope.updateSearchValue();
          });
        };
      }],
      link: function (scope, element, attrs) {
        element.on('click', function () {
          var prefix = attrs.setToSearchBox,
              value = (element.html().trim() || element.attr('title').trim());

          if (_.isString(value)) {
            value = '\'' + value + '\'';
          }

          scope.click(prefix + '==' + value);
        });
      }
    };
  }])

  /**
   * Submit the form with ctrl enter.
   */
  .directive('submitOnCtrlEnter', [function () {
    return {
      restrict: 'A',
      link: function (scope, element) {
        element.on('keydown', function (e) {
          if (e.keyCode === 13 && e.ctrlKey) {
            element.find('[type=submit]').eq(0).click();
          }
        });
      }
    };
  }]);
})();
