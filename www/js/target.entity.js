(function () {
  'use strict';

  angular.module('procKr.entity.target', [
    'procKr.service.webSocket'
  ])

  /**
   * Return an object ready to be instanciated to describe a Target entity.
   */
  .factory('targetFactory', ['webSocketService', function (webSocket) {
    var Target = function (properties) {
      this._id =
      this._port =
      this._url =
      this._status =
      this._isRecording =
      this._isMocked =
      this._isEnabled;

      _.privateMerge(this, properties);
    };

    Target.prototype.id = function () {
      return this._id;
    };

    Target.prototype.port = function () {
      return this._port;
    };

    Target.prototype.url = function () {
      return this._url;
    };

    Target.prototype.isMocked = function () {
      return this._isMocked;
    };

    Target.prototype.isRecording = function () {
      return this._isRecording;
    };

    /**
     * Add the target by emitting a websocket to the server.
     */
    Target.prototype.add = function () {
      webSocket.emit('addTarget', _.publicProperties(this));
    };

    /**
     * Remove the target from the DB by emitting a websocket to the server.
     */
    Target.prototype.remove = function () {
      webSocket.emit('removeTarget', _.publicProperties(this));
    };

    /**
     * Set the target to record false/true in the DB by emitting a websocket
     * to the server.
     */
    Target.prototype.toggleRecording = function () {
      // need to switch the flag here because the template is not binded to a
      // model
      this._isRecording = !this._isRecording;
      webSocket.emit('toggleRecordingTarget', _.publicProperties(this));
    };

    /**
     * Enable/disable the mock.
     */
    Target.prototype.toggleMock = function () {
      webSocket.emit('toggleMockTarget', _.publicProperties(this));
    };

    /**
     * Set the target to enabled true/false in the DB by emitting a websocket
     * to the server.
     */
    Target.prototype.toggleEnable = function () {
      webSocket.emit('toggleEnableTarget', _.publicProperties(this));
    };

    /**
     * Start the target by emitting a websocket to the server.
     */
    Target.prototype.start = function () {
      webSocket.emit('startTarget', _.publicProperties(this));
    };

    /**
     * Stop the target by emitting a websocket to the server.
     */
    Target.prototype.stop = function () {
      webSocket.emit('stopTarget', _.publicProperties(this));
    };

    /**
     * Start the mock by emitting a websocket to the server.
     */
    Target.prototype.mock = function () {
      webSocket.emit('mockTarget', _.publicProperties(this));
    };

    return Target;
  }]);
})();