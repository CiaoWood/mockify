'use strict';

module.exports = (function () {
  var _             = require('../lib/helper')._;

  var Record = function (properties) {
    this._id =
    this._uuid =
    this._dateCreated =
    this._status =
    this._url =
    this._method =
    this._parameters =
    this._reqHeaders =
    this._resHeaders =
    this._body =
    this._comment =
    this._targetId;

    _.privateMerge(this, properties);
  };

  Record.prototype.id = function () {
    return this._id;
  };

  return Record;
})();
