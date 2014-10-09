'use strict';

module.exports = function () {
  var conf      = require('./../daemon/lib/conf'),
      Q         = require('q');

  /**
   * Say hello to the mockify websocket server.
   */
  var say = function () {
    var deferred = Q.defer();

    conf().read().then(function (config) {
      var socket   = require('socket.io-client')
                     ('http://localhost:' + config.websocket.port);

      var attempts = 0;
      setInterval(function () {
        process.stdout.write('.');
        attempts++;

        if (attempts > 5) {
          deferred.reject('Can\'t connect to mockify :(');
        }
      }, 1000);

      socket.emit('hello');
      socket
        .on('hello', deferred.resolve)
        .on('alert', deferred.reject);
    });

    return deferred.promise;
  };

  return {
    say: say
  };
};
