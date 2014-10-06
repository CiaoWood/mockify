'use strict';

module.exports = function (config) {
  return require('socket.io').listen(config.port);
};
