'use strict';

module.exports = (function () {
  var db      = require('./../lib/db')(),
      _       = require('./../lib/helper')._,
      Record  = require('./../entity/record');

  /**
   * List records.
   * @param  {Function} callback
   */
  var list = function (callback) {
    db.model('Record').find({}, function (err, records) {
      callback(err, _.map(records, function (properties) {
        return new Record(properties);
      }));
    });
  };

  /**
   * Remove a record in database.
   * @param  {record}   record
   * @param  {Function} callback
   */
  var remove = function (record, callback) {
    db.model('Record').find({id: record.id()}).remove(callback);
  };

  return {
    list: list,
    remove: remove
  };
})();
