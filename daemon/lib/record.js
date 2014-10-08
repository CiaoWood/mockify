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
   * Remove a record.
   * @param  {Object} recordProperties
   */
  var remove = function (recordProperties) {
    var deferred = Q.defer();

    recordStorage.remove(new Record(recordProperties), function (err) {
      err && deferred.reject(err) ||
        deferred.resolve('The record has been removed.');
    });

    return deferred.promise;
  };

  return {
    list: list,
    remove: remove
  };
};
