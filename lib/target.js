'use strict';

module.exports = function () {
  var conf      = require('./../daemon/lib/conf'),
      _         = require('lodash'),
      Q         = require('q');

  /**
   * List the targets.
   */
  var list = function () {
    var deferred = Q.defer();

    _getSocket().then(function (socket) {
      socket.emit('listTargets');
      socket
        .on('listTargets', deferred.resolve)
        .on('alert', deferred.reject);
    });

    return deferred.promise;
  };

  /**
   * Add a target.
   * @param {int}     port
   * @param {string}  url
   */
  var add = function (port, url) {
    var deferred = Q.defer();

    _getSocket().then(function (socket) {
      socket.emit('addTarget', {port: port, url: url});
      socket
        // listen a listTargets event to displayed current targets
        .on('listTargets', deferred.resolve)
        .on('alert', deferred.reject);
    });

    return deferred.promise;
  };

  /**
   * Remove a target.
   * @param {int}     id
   */
  var remove = function (id) {
    var deferred = Q.defer();

    _getSocket().then(function (socket) {
      socket.emit('removeTarget', {id: id});
      socket
        .on('removeTarget', deferred.resolve)
        .on('alert', deferred.reject);
    });

    return deferred.promise;
  };

  /**
   * Disable a target.
   * @param {int}     id
   */
  var disable = function (id) {
    var deferred = Q.defer();

    _getSocket().then(function (socket) {
      socket.emit('disableTarget', {id: id});
      socket
        .on('disableTarget', deferred.resolve)
        .on('alert', deferred.reject);
    });

    return deferred.promise;
  };

  /**
   * Enable/disable the recording of data passing through a proxy.
   * @param {int}     id
   */
  var recording = function (id, bool) {
    var deferred = Q.defer();

    _getSocket().then(function (socket) {
      socket.emit('recordingTarget', {
        targetProperties: {id: id},
        status: bool
      });
      socket
        .on('recordingTarget', deferred.resolve)
        .on('alert', deferred.reject);
    });

    return deferred.promise;
  };

  /**
   * Start the proxy of a target.
   * @param {int}     id
   */
  var startProxy = function (id) {
    var deferred = Q.defer();

    _getSocket().then(function (socket) {
      socket.emit('startProxy', {id: id});
      socket
        .on('startProxy', deferred.resolve)
        .on('alert', deferred.reject);
    });

    return deferred.promise;
  };

  /**
   * Start the mock of a target.
   * @param {int}     id
   */
  var startMock = function (id) {
    var deferred = Q.defer();

    _getSocket().then(function (socket) {
      socket.emit('startMock', {id: id});
      socket
        .on('startMock', deferred.resolve)
        .on('alert', deferred.reject);
    });

    return deferred.promise;
  };

  /**
   * Return an eventEmitter and emit event each time a log is coming from the
   * process childs.
   * Used to display logs in the cli.
   */
  var log = function () {
    var eventEmitter_ = new (require('events').EventEmitter)();

    _getSocket().then(function (socket) {
      _.forEach(['proxy', 'mock'], function (eventSource) {
        socket
          .on(eventSource + 'Out', function (logData) {
            eventEmitter_.emit('out', logData);
          })
          .on(eventSource + 'Response', function (logData) {
            eventEmitter_.emit('response', logData);
          })
          .on(eventSource + 'Error', function (logData) {
            // the 'error' event throws an error (?)
            eventEmitter_.emit('error_', logData);
          });
      });
    });

    return eventEmitter_;
  };

  /**
   * Return a promise resolved with the socket connection.
   * We have a deferred here because the config is read asynchronously.
   */
  var _getSocket = function () {
    var deferred = Q.defer();

    conf().read().then(function (config) {
      var socket   = require('socket.io-client')
                     ('http://localhost:' + config.websocket.port);

      deferred.resolve(socket);
    });

    return deferred.promise;
  };

  return {
    list: list,
    add: add,
    remove: remove,
    disable: disable,
    recording: recording,
    startProxy: startProxy,
    startMock: startMock,
    log: log
  };
};
