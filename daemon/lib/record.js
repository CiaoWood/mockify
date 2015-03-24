'use strict';

module.exports = function () {
  var Q               = require('q'),
      Record          = require('./../entity/record'),
      recordStorage   = require('./../storage/record'),
      _               = require('./../lib/helper')._,
      moment          = require('moment');

  /**
   * List all records.
   */
  var list = function () {
    var deferred = Q.defer();

    recordStorage.list(function (err, records) {
      if (err) {
        deferred.reject(err);
        return;
      }

      deferred.resolve(records);
    });

    return deferred.promise;
  };

  /**
   * Add a record.
   */
  var add = function (properties) {
    var deferred = Q.defer();

    properties = _.defaults({
      _uuid: _.uuid(),
      _dateCreated: moment().toDate()
    }, properties);

    recordStorage.create(new Record(properties),
      function (err) {
        err && deferred.reject(err);
        deferred.resolve('The record has been added.');
      }
    );

    return deferred.promise;
  };

  /**
   * Update a record.
   */
  var update = function (properties) {
    var deferred = Q.defer();

    recordStorage.update(new Record(properties), properties,
      function (err) {
        err && deferred.reject(err);
        deferred.resolve('The record has been updated.');
      }
    );

    return deferred.promise;
  };

  /**
   * Remove a record.
   */
  var remove = function (properties) {
    var deferred = Q.defer();

    recordStorage.remove(new Record(properties), function (err) {
      err && deferred.reject(err) ||
        deferred.resolve('The record has been removed.');
    });

    return deferred.promise;
  };

  return {
    list: list,
    add: add,
    update: update,
    remove: remove
  };
};
