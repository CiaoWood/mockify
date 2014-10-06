'use strict';

module.exports = function () {
  var fs                = require('fs'),
      path              = require('path'),
      ini               = require('ini'),
      homeDir           = process.env.HOME || process.env.HOMEPATH ||
                            process.env.USERPROFILE,
      mockifyDir        = path.join(homeDir, '.mockify'),
      mockifyConfFile   = path.join(homeDir, '.mockifyrc');

  /**
   * Create the mockify home dir.
   * @param  {Function} callback
   */
  var createMockifyDir = function (callback) {
    fs.mkdir(mockifyDir, 484, function (err) {  // 484 => 0744
      if (err) {
        if (err.code === 'EEXIST') {
          // ignore the error if the folder already exists
          callback(null, mockifyDir);
        }
        else {
          callback(err);
        }
      } else {
        // successfully created folder
        callback(null, mockifyDir);
      }
    });
  };

  /**
   * Return a promise resolved with the config content.
   */
  var read = function () {
    var Q = require('q'),
        deferred = Q.defer();

    _readMockifyRc(function (err, data) {
      err && deferred.reject(err);
      deferred.resolve(data);
    });

    return deferred.promise;
  };

  /**
   * Create the mockify config file.
   * @param  {Function} callback
   */
  var _createMockifyConfFile = function (callback) {
    var iniContent = ini.stringify(_defaultConfig());

    fs.writeFile(mockifyConfFile, iniContent, function (err) {
      if (err) {
        callback(err);
      }
      else {
        callback(null);
      }
    });
  };

  /**
   * Read the mockify config file.
   * @param  {Function} callback
   */
  var _readMockifyRc = function (callback) {
    fs.readFile(mockifyConfFile, 'utf8', function (err, data) {
      if (err) {
        if (err.code === 'ENOENT') {
          _createMockifyConfFile(function (err) {
            if (!err) {
              _readMockifyRc(callback);
            }
            else {
              callback(err);
            }
          });
        } else {
          callback(err);
        }
      }
      else {
        callback(null, ini.parse(data));
      }
    });
  };

  /**
   * Return the default config of mockify.
   * @return {Object}
   */
  var _defaultConfig = function () {
    return {
      daemon: {
        port: 5000
      },
      websocket: {
        port: 5001
      },
      http: {
        port: 3000
      }
    };
  };

  return {
    read: read,
    createMockifyDir: createMockifyDir
  };
};
