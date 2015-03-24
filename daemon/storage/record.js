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
   * Create a record in database.
   * @param  {Record}   record
   * @param  {Function} callback
   */
  var create = function (record, callback) {
    var params = _.publicProperties(record, [
      '_uuid', '_dateCreated',
      '_status', '_url', '_method',
      '_parameters', '_reqHeaders', '_resHeaders', '_body',
      '_comment', '_delay', '_targetId'
    ]);

    db.model('Record').create([params], callback);
  };

  /**
   * Update a record in database.
   * @param  {Record}   record
   * @param  {Object}   properties
   * @param  {Function} callback
   */
  var update = function (record, properties, callback) {
    db.model('Record').get(record.id(), function (err, record_) {
      if (record_) {
        _.merge(record_, properties);

        record_.save(function (err, row) {
          callback(err, !err && new Record(row));
        });
      }
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
    create: create,
    update: update,
    remove: remove
  };
})();
