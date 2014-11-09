(function () {
  'use strict';

  angular.module('mockify.service.localStorage', [
  ])

  .service('localStorageService', ['$window', function ($window) {
    var lS = $window.localStorage;

    /**
     * Parse and return a value from the localStorage.
     */
    this.get = function (key, limit) {
      limit = limit || 10;

      var results = [];
      var list = _.has(lS, key) && JSON.parse(lS[key]);

      if (_.isArray(list)) {
        var sliceIndex = list.length - limit;
        if (sliceIndex < 0) {
          sliceIndex = 0;
        }

        results = list.slice(sliceIndex);
      }

      return results;
    };

    /**
     * Return the last value of a key of the localStorage if it's an array.
     */
    this.last = function (key) {
      var parsedValues;

      return _.has(lS, key) &&
        _.isArray(parsedValues = JSON.parse(lS[key])) &&
        _.last(parsedValues);
    };

    /**
     * Push a value in a key of the localStorage.
     */
    this.push = function (key, value) {
      var savedValue = this.get(key);

      if (_.isArray(savedValue)) {
        savedValue.push(value);
        this.save(key, _.uniq(savedValue));
      } else {
        this.save(key, [value]);
      }
    };

    /**
     * Save a value in a key of the localStorage.
     */
    this.save = function (key, value) {
      lS[key] = JSON.stringify(value);
    };

    /**
     * Delete a key of the localStorage.
     */
    this.delete = function (key) {
      delete lS[key];
    };
  }]);
})();
