(function () {
  'use strict';

  angular.module('mockify.service.searchHistory', [
  ])

  /**
   * Return a Search object which handles a search.
   */
  .factory('searchHistoryFactory', ['$rootScope',
    function searchHistoryFactory($rootScope) {
      var Search = function () {
        this._value = null;

        /**
         * Get/set a value.
         */
        this.value = function (value) {
          if (angular.isDefined(value)) {
            this._value = value;
          }
          return this._value;
        };

        /**
         * Eval the expression with the value.
         */
        this.eval_ = function (locals) {
          var expression = this._value || 'true';
          return $rootScope.$eval(expression, locals);
        };
      };

      return {
        new: function () {
          return new Search();
        }
      };
    }
  ]);
})();
