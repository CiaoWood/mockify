(function () {
  'use strict';

  angular.module('mockify.entity.record', [
  ])

  /**
   * Return an object ready to be instanciated to describe a Target entity.
   */
  .factory('recordFactory', [function recordFactory() {
    var Record = function (properties) {
      _.privateMerge(this, properties);
    };

    Record.prototype.body = function () {
      return (this._body && JSON.stringify(this._body)) || '-';
    };

    return Record;
  }]);
})();
