(function () {
  'use strict';

  angular.module('mockify.dashboard.directive.submitOnCtrlEnter', [
  ])

  /**
   * Submit the form with ctrl enter.
   */
  .directive('submitOnCtrlEnter', [function () {
    return {
      restrict: 'A',
      link: function (scope, element) {
        element.on('keydown', function (e) {
          if (e.keyCode === 13 && e.ctrlKey) {
            element.find('[type=submit]').eq(0).click();
          }
        });
      }
    };
  }]);

})();





