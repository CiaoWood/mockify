(function () {
  'use strict';

  angular.module('mockify.record.controller.record', [
    'truncate',
    'mockify.common.service.webSocket',
    'mockify.record.entity.record',
    'mockify.dashboard.directive.setToSearchBox',
    'mockify.dashboard.directive.submitOnCtrlEnter'
  ])

  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('app.dashboard.records', {
        url: '/records',
        views: {
          'primaryContainer@app': {
            templateUrl: 'records.html',
            controller: 'RecordCtrl'
          }
        }
      })
        .state('app.dashboard.records.edit', {
          url: '/:id/edit',
          views: {
            'recordEdition': {
              templateUrl: 'record-edition.html',
              controller: 'RecordEditionCtrl'
            }
          }
        })
        .state('app.dashboard.records.add', {
          url: '/add',
          views: {
            'primaryContainer@app': {
              templateUrl: 'record-addition.html',
              controller: 'RecordAdditionCtrl'
            }
          }
        });
  }])

  /**
   * Handle records in database.
   */
  .controller('RecordCtrl', [
    '$scope',
    '$state',
    'webSocketService',
    'recordFactory',

    function RecordCtrl(
      $scope,
      $state,
      webSocket,
      Record
    ) {
      // init the search box with object searchs saved in the scope parent
      $scope.search.value = $scope.getSearchObject().value();

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
  ]);

})();
