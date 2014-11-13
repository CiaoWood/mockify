(function () {
  'use strict';

  angular.module('mockify.entity.response', [
  ])

  /**
   * Return objects to description a proxy response.
   */
  .factory('proxyResponseFactory', [function () {
    var ProxyResponse = function (properties) {
      this._source = 'proxy';
      this._status =
      this._method =
      this._host =
      this._url =
      this._targetHost;

      if (_.isObject(properties)) {
        _.privateMerge(this, properties);
      } else if (_.isString(properties)) {
        // extract message from the proxy binary
        var parts = properties.split(';');
        this._status      = parts[0];
        this._method      = parts[1];
        this._host        = parts[2];
        this._url         = parts[3];
        this._targetHost  = parts[4];
      }
    };

    return ProxyResponse;
  }])

  /**
   * Return objects to description a proxy response.
   */
  .factory('mockResponseFactory', [function () {
    var MockResponse = function (properties) {
      this._source = 'mock';
      this._status =
      this._method =
      this._host =
      this._url;

      if (_.isObject(properties)) {
        _.privateMerge(this, properties);
      } else if (_.isString(properties)) {
        // extract message from the mock binary
        var parts = properties.split(';');
        this._status    = parts[0];
        this._method    = parts[1];
        this._host      = parts[2];
        this._url       = parts[3];
        this._recordId  = parseInt(parts[4].trim());
      }
    };

    return MockResponse;
  }]);
})();
