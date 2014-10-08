'use strict';

module.exports = (function () {
  var db      = require('./../lib/db')(),
      _       = require('./../lib/helper')._,
      Record  = require('./../entity/record');

  /**
   * List targets.
   * @param  {Function} callback
   */
  var list = function (callback) {
    db.model('Record').find({}, function (err, records) {
      callback(err, _.map(records, function (properties) {
        return new Record(properties);
      }));
    });
  };

  return {
    list: list
  };
})();
