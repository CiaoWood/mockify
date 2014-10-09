'use strict';

module.exports = function (io) {
  /**
   * Emit an info.
   */
  var info = function (message) {
    io.emit('alertInfo', {message: message});
  };

  /**
   * Emit an error.
   */
  var error = function (message) {
    message = message || 'An unknown error has occurred :(';
    io.emit('alert', {message: message});
  };

  return {
    info: info,
    error: error
  };
};
