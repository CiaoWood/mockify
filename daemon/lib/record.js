'use strict';

module.exports = function () {
  var Q               = require('q'),
      recordStorage   = require('./../storage/record');

  /**
   * Emit a ws with the list of records.
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

  return {
    list: list
  };
};
