'use strict';

module.exports = (function () {
  var mainApp = require('./main')(),
      server  = require('http').Server(mainApp),
      argv    = require('minimist')(process.argv.slice(2));

  server.listen(argv.port);

  console.log('The http server is listening on port %s.', argv.port);
})();
