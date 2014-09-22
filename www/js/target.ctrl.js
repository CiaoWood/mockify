(function () {
  'use strict';

  angular.module('procKr.process', [
    'procKr.service.webSocket',
    'procKr.service.localStorage',
    'procKr.entity.target',

    'toggle-switch'
  ])

  .controller('TargetCtrl', [
    '$scope',
    '$interval',
    'webSocketService',
    'localStorageFactory',
    'targetFactory',

    function (
      $scope,
      $interval,
      webSocket,
      localStorage,
      Target
    ) {

      var initDefaultUrl = function () {
        $scope.targetsStored = localStorage.get('targets', 10);
        return localStorage.last('targets') ||
          'http://jsonplaceholder.typicode.com';
      };

      $scope.targetList = [];

      $scope.defaultValues = {
        url: initDefaultUrl(),
        port: 4000
      };

      /**
       * Register a target in the DB and start it.
       */
      $scope.addAndStartTarget = function (port, url, status) {
        // @TODO check format
        // see https://gist.github.com/jlong/2428561
        port = port || $scope.defaultValues.port;
        url = url || $scope.defaultValues.url;

        // save the url
        localStorage.push('urls', url);

        // create an entity
        var target = new Target({
          port: port,
          url: url,
          status: status,
          isEnabled: 0,
          isMocked: 0
        });

        // send websockets
        target.add();
        target.start();

        delete $scope.target;
        delete $scope.port;

        $scope.defaultValues.target = initDefaultUrl();
      };

      /**
       * Stop and remove a target from the DB
       * @param  {Target}  target  Target entity
       */
      $scope.removeTarget = function (target) {
        target.stop();
        target.remove();
      };

      /**
       * Enable/Disable the record for a target.
       */
      $scope.toggleRecordTarget = function (target) {
        target.toggleRecording();
      };

      /**
       * Enable the target / Disable the mock
       * Disable the target / Enable the mock
       */
      $scope.toggleMockTarget = function (target) {
        target.toggleMock();
      };

      /**
       * Enable/disable the target.
       */
      $scope.toggleEnableTarget = function (target) {
        target.toggleEnable();
      };

      /**
       * Websockets events
       */

      /**
       * Get the list of targets.
       */
      var listTargets = function () {
        webSocket.emit('listTargets');

        webSocket.on('listTargets', function (targets) {
          $scope.$apply(function () {
            $scope.targetsList = _.map(targets, function (targetProperties) {
              return new Target(targetProperties);
            });
          });
        });
      };

      listTargets();

      // refresh targets every X seconds
      $interval(listTargets, 3000);
    }
  ]);
})();