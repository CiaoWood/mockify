'use strict';

module.exports = function () {
  var Q               = require('q'),
      Record          = require('./../entity/record'),
      recordStorage   = require('./../storage/record');

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
   * Update a record.
   * @param  {Record} record
   * @param  {Object} properties
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
   * @param  {Object} properties
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
    update: update,
    remove: remove
  };
};
