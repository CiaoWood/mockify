/**
 * This file is the mockify websocket interface, started as a daemon.
 */

'use strict';

module.exports = (function () {
  var _               = require('lodash'),
      conf            = require('./lib/conf'),
      db              = require('./lib/db')(),
      target          = require('./lib/target')(),
      record          = require('./lib/record')();

  var initIO = function (io, http, alert) {
    // when childs are talking, send messages via websockets to the client
    _.forEach(['proxy', 'mock'], function (eventSource) {
      target.eventEmitter()
        .on(eventSource + 'Out', function (logData) {
          io.emit('proxyOut', logData);
        })
        .on(eventSource + 'Response', function (logData) {
          io.emit('proxyResponse', logData);
        })
        .on(eventSource + 'Error', function (logData) {
          io.emit('proxyError', logData);
        });
    });

    var listTargets = function () {
      target.list().then(function (targets) {
        io.emit('listTargets', {
          message: 'List of saved targets:',
          targets: targets
        });
      }, alert.error);
    };

    var listRecords = function () {
      record.list().then(function (records) {
        io.emit('listRecords', {
          message: 'List of records:',
          records: records
        });
      }, alert.error);
    };

    // send to the client the list of targets every X seconds
    setInterval(listTargets, 3000);

    // listen events from the client and answer with the same event
    io.sockets.on('connection', function (socket) {
      socket.on('hello', function () {
        io.emit('hello', 'Hi! This is mockify daemon.');
      });

      socket.on('startHttp', function () {
        http.start().then(function (msgLog) {
          io.emit('startHttp', msgLog);
        }, alert.error);
      });

      socket.on('stopHttp', function () {
        http.stop().then(function (msgLog) {
          io.emit('stopHttp', msgLog);
        }, alert.error);
      });

      socket.on('listTargets', listTargets);

      socket.on('addTarget', function (targetProperties) {
        target.add(targetProperties).then(function (targets) {
          io.emit('listTargets', {
            message: 'The target has been added.',
            targets: targets
          });
        }, alert.error);
      });

      socket.on('removeTarget', function (targetProperties) {
        target.disable(targetProperties)
          .then(function () {
            return target.remove(targetProperties);
          }, alert.error)
          .then(function (msgLog) {
            io.emit('removeTarget', msgLog);
          }, alert.error);
      });

      socket.on('enableTarget', function (targetProperties) {
        // enable a target starts a proxy but return it own websocket event
        target.startProxy(targetProperties).then(function (childStdout) {
          io.emit('enableTarget', childStdout);
        }, alert.error);
      });

      socket.on('disableTarget', function (targetProperties) {
        target.disable(targetProperties).then(function (msgLog) {
          io.emit('disableTarget', msgLog);
        }, alert.error);
      });

      socket.on('recordingTarget', function (data) {
        target.recording(data)
          .then(function (msgLog) {
            io.emit('recordingTarget', msgLog);
          }, alert.error);
      });

      socket.on('startProxy', function (targetProperties) {
        target.startProxy(targetProperties).then(function (childStdout) {
          io.emit('startProxy', childStdout);
        }, alert.error);
      });

      socket.on('startMock', function (targetProperties) {
        target.startMock(targetProperties).then(function (childStdout) {
          io.emit('startMock', childStdout);
        }, alert.error);
      });

      socket.on('listRecords', listRecords);

      socket.on('updateRecord', function (recordProperties) {
        record.update(recordProperties).then(alert.info, alert.error);
      });

      socket.on('removeRecord', function (recordProperties) {
        record.remove(recordProperties).then(function () {
          listRecords();
        }, alert.error);
      });
    });
  };

  conf().read().then(function (config) {
    var io      = require('./lib/io')(config.websocket),
        http    = require('./lib/http')(config.http),
        alert   = require('./lib/alert')(io);

    // create the database if it not exists.
    db.create();

    // start the http server
    http.start().then(function (msgLog) {
      // @FIXME
      console.log(msgLog);
    }, alert.error);

    initIO(io, http, alert);
  });
})();
