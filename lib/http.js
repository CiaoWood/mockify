'use strict';

module.exports = function () {
  var conf      = require('./../daemon/lib/conf'),
      Q         = require('q');

  /**
   * Start the web app.
   */
  var start = function () {
    var deferred = Q.defer();

    conf().read().then(function (config) {
      var socket   = require('socket.io-client')
                     ('http://localhost:' + config.websocket.port);

      socket.emit('startHttp');
      socket
        .on('startHttp', deferred.resolve)
        .on('alert', deferred.reject);
    });

    return deferred.promise;
  };

  /**
   * Stop the web app.
   */
  var stop = function () {
    var deferred = Q.defer();

    conf().read().then(function (config) {
      var socket   = require('socket.io-client')
                     ('http://localhost:' + config.websocket.port);

      socket.emit('stopHttp');
      socket
        .on('stopHttp', deferred.resolve)
        .on('alert', deferred.reject);
    });

    return deferred.promise;
  };

  return {
    start: start,
    stop: stop
  };
};
