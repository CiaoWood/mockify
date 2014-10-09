/* global io */

(function () {
  'use strict';

  angular.module('mockify.service.webSocket', [
    'mockify.service.config'
  ])

  .factory('webSocketService', ['$rootScope', '$interval', 'configFactory',
    function ($rootScope, $interval, config) {
      var socket = io('http://localhost:' + config.websocket.port);

      // check that the websocket server is up every X secs
      $interval(function () {
        if (!socket.connected) {
          $rootScope.alertError('Websocket server has gone away!');
        }
        // } else {
          // @TOFIX Unhide only 'Websocket server has gone away!' errors...
          // $rootScope.$emit('hideAlert');
        // }
      }, 10000);

      return {
        on: function (event_, callback) {
          socket.on(event_, function (data) {
            callback(data);
          });
        },

        emit: function (event_, data) {
          socket.emit(event_, data);
        }
      };
    }
  ]);
})();
