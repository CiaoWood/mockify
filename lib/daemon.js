'use strict';

module.exports = function () {
  var _         = require('lodash'),
      fs        = require('fs'),
      path      = require('path'),
      Q         = require('q'),
      forever   = require('forever'),
      isRunning = require('is-running'),
      conf      = require('./../daemon/lib/conf')();

  /**
   * Start the mockify daemon.
   */
  var start = function () {
    var deferred = Q.defer();

    conf.createMockifyDir(function (err, mockifyDir) {
      if (err) {
        deferred.reject(err);
        return;
      }

      var daemonRootDir = path.resolve(__dirname, '..', 'daemon'),
          daemonFile = path.join(daemonRootDir, 'mockify.js');

      forever.startDaemon(daemonFile, {
        silent          : false,
        max             : 10,
        watch           : true,
        watchDirectory  : daemonRootDir,
        cwd             : daemonRootDir,
        logFile         : path.join(mockifyDir, 'mockify.log'),
        outFile         : path.join(mockifyDir, 'mockify.out.log'),
        errFile         : path.join(mockifyDir, 'mockify.err.log')
      });

      // @FIXME Handle forever errors
      deferred.resolve('mockify daemon has been started.');
    });

    return deferred.promise;
  };

  /**
   * Stop the mockify daemon.
   * Loop over live processes and resolve the deferred once all processes are
   * killed.
   */
  var stop = function () {
    var deferred = Q.defer();

    var attempts = 0,
        message = 'Mockify is not running.',
        tryingToStop = false;

    var interval = setInterval(function () {
      process.stdout.write('.');

      forever.list(false, function (err, processes) {
        if (!tryingToStop && _.isArray(processes)) {
          // @FIXME Handle error if stopping when mockify is not started
          forever.stopAll().on('stopAll', function () {
            // @FIXME Handle forever errors
            deferred.resolve('Mockify daemon has been stopped.');
          });

          tryingToStop = true;
        }

        var allKilled = false;
        _.forEach(processes, function (process) {
          allKilled = allKilled && !isRunning(process.pid);
        });

        if (allKilled) {
          deferred.resolve(message);
        }
      });

      if (attempts > 5) {
        clearInterval(interval);
        deferred.resolve(message);
      }

      attempts++;
    }, 500);

    return deferred.promise;
  };

  return {
    start: start,
    stop: stop
  };
};
