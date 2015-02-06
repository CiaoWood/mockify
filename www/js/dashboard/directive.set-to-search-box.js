(function () {
  'use strict';

  angular.module('mockify.dashboard.directive.setToSearchBox', [
  ])

  /**
   * When clicking on a tag, save its value in the search box.
   */
  .directive('setToSearchBox', [function setToSearchBox() {
    return {
      restrict: 'A',
      controller: ['$scope', function ($scope) {
        $scope.click = function (value) {
          $scope.$apply(function () {
            $scope.search.value = value;
            $scope.updateSearchValue();
          });
        };
      }],
      link: function (scope, element, attrs) {
        element.on('click', function () {
          var prefix = attrs.setToSearchBox,
              value = (element.html().trim() || element.attr('title').trim());

          if (_.isString(value)) {
            value = '\'' + value + '\'';
          }

          scope.click(prefix + '==' + value);
        });
      }
    };
  }]);

})();
