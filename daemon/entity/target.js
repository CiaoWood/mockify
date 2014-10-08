'use strict';

module.exports = (function () {
  var _             = require('../lib/helper')._;

  var Target = function (properties) {
    // var self = this;

    this._id =
    this._port =
    this._url =
    this._recording = true,
    this._mocking = false,
    this._proxying = false,
    this._enabled = false;

    _.privateMerge(this, properties);
  };

  Target.prototype.id = function () {
    return this._id;
  };

  Target.prototype.recording = function (boolean_) {
    if (boolean_) {
      this._recording = boolean_;
      return this;
    }
    return this._recording;
  };

  Target.prototype.mocking = function (boolean_) {
    if (boolean_) {
      this._mocking = boolean_;
      this._enabled = this._mocking || this._proxying;
      return this;
    }
    return this._mocking;
  };

  Target.prototype.proxying = function (boolean_) {
    if (boolean_) {
      this._proxying = boolean_;
      this._enabled = this._mocking || this._proxying;
      return this;
    }
    return this._proxying;
  };

  /**
   * Properties validation.
   * Return a boolean.
   */
  Target.prototype.isValid = function () {
    var rules = [
      /\d+/.test(this._port) && this._port > 1 && this._port < 9999,
      /^(https?:\/\/)?([\w\.-\/]+)(:\d{0,4})?$/.test(this._url)
    ];

    return _.all(rules);
  };

  /**
   * Return the keys ordered for cli output.
   */
  Target.prototype.orderedKeys = function () {
    return [
      '_id', '_port', '_url',
      '_recording', '_proxying', '_mocking', '_enabled'
    ];
  };

  return Target;
})();
