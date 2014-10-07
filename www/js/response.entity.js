(function () {
  'use strict';

  angular.module('mockify.entity.response', [
  ])

  /**
   * Return an object ready to be instanciated to describe a Target entity.
   */
  .factory('proxyResponseFactory', [function () {
    var ProxyResponse = function (properties) {
      this._source = 'proxy';
      this._status =
      this._host =
      this._url =
      this._targetHost;

      if (_.isObject(properties)) {
        _.privateMerge(this, properties);
      } else if (_.isString(properties)) {
        var parts = properties.split(';');
        this._status      = parts[0];
        this._host        = parts[1];
        this._url         = parts[2];
        this._targetHost  = parts[3];
      }
    };

    // ProxyResponse.prototype.id = function () {
    //   return this._id;
    // };

    return ProxyResponse;
  }]);
})();
