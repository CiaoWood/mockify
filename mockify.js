'use strict';

module.exports = (function () {
  var daemon    = require('./lib/daemon')(),
      status    = require('./lib/status')(),
      hello     = require('./lib/hello')(),
      http      = require('./lib/http')(),
      target    = require('./lib/target')();

  return {
    start:            daemon.start,
    stop:             daemon.stop,
    status:           status.get,
    sayHello:         hello.say,
    startHttp:        http.start,
    stopHttp:         http.stop,
    listTargets:      target.list,
    addTarget:        target.add,
    removeTarget:     target.remove,
    disableTarget:    target.disable,
    recordingTarget:  target.recording,
    startProxy:       target.startProxy,
    startMock:        target.startMock,
    log:              target.log
  };
})();
