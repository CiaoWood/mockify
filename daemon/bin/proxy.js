/**
 * This is the proxy binary which allows to proxy and save queries in the
 * mockify database?
 */

/* global Buffer */

'use strict';

var httpProxy   = require('http-proxy'),
    jsonBody    = require('body/json'),
    argv        = require('minimist')(process.argv.slice(2)),
    _           = require('lodash'),
    _s          = require('underscore.string'),
    moment      = require('moment'),
    url         = require('url'),
    db          = require('../lib/db')(),
    targetId    = argv.targetId,
    exit        = function () {
      process.exit(1);
    },

    responsesToHandle   = {};

/**
 * Write log on stdout.
 */
var log = function (message) {
  process.stdout.write('[proxy-out] ' + message + '\n');
};

var logError = function (message) {
  process.stderr.write('[proxy-error] ' + message + '\n');
};

var logResponse = function (message) {
  process.stdout.write('[proxy-response] ' + message + '\n');
};

/**
 * Init a loop to handle saved responses.
 * A response is inserted in DB if:
 *  - marked as 'end'(ed)
 *  - if the body has been (json) parsed
 */
setInterval(function () {
  _.forEach(responsesToHandle, function (data, uuid) {
    // wait the response to be finished
    if (!data.end) {
      return true;
    }

    // check body
    if (data.body) {
      try {
        data.body = JSON.parse(data.body);
      }
      catch (err) {
        data.body = undefined;
      }
    }

    // if body, create or update the response
    if (data.body) {
      db.model('Record').find({uuid: uuid}, function (err, responses) {
        var response = _.first(responses);

        if (!response) {
          db.model('Record').create([data], function (err) {
            err && logError('An error has occurred ' + err);
          });
        } else {
          // update properties
          _.assign(response, data);

          response.save(function (err) {
            err && logError('An error has occurred. ' + err);
          });
        }
      });
    } else {
      // if invalid body, delete it
      delete responsesToHandle[uuid];
    }
  });
}, 2000);

/**
 * Start the proxy.
 * @param  {int}  port  Port to listen
 * @param  {url_} url_  Url to proxy
 */
var startProxy = function (target) {
  log(_s.sprintf('Proxy listening on localhost:%s and proxying %s',
    target.port, target.url));

  // create proxy
  var proxy = httpProxy.createProxyServer({
    secure: false,
    xfwd: true
  });

  var server = require('http').createServer(function (req, res) {
    // You can define here your custom logic to handle the request
    // and then proxy the request.
    proxy.web(req, res, {target: target.url});
  });

  server.listen(target.port);

  proxy.on('proxyReq', function handleProxyRequest(proxyReq, req, res) {
    // hack the host in the header to be able to proxy a different host
    var parsedTarget = url.parse(target.url);
    proxyReq._headers.host = parsedTarget.host;

    // generate a random uuid to not match Etag and avoid "304 not modified"
    // (304 responses will not trigger the 'data' event from the response object
    // and therefore we can't save body in database)
    proxyReq._headers['if-none-match'] = _.uuid();

    // don't send the cookies of localhost
    proxyReq._headers.cookie = '';

    // save the response only if recording the target
    if (target.recording) {
      // set a header to identify the query in order to save its response
      var uuid = _.uuid();
      proxyReq.setHeader('X-mockify-rowuuid', uuid);

      // decode body to json
      jsonBody(req, res, function (__, json) {
        var data = {
          uuid: uuid,
          dateCreated: moment().toDate(),
          url: req.url,
          method: req.method,
          parameters: (_.isObject(json) && json) || {},
          reqHeaders: req.headers,
          targetId: targetId,
          delay: 0
        };

        // save data in order to handle them in the loop
        responsesToHandle[uuid] = data;
      });
    }
  });

  proxy.on('proxyRes', function (res) {
    // do nothing if not recording the target
    if (!target.recording) {
      return;
    }

    var buffers = [];
    res.on('data', function (chunk) {
      buffers.push(chunk);
    });

    res.on('end', function () {
      var res_ = this.req.res,
          uuid = this.req._headers['x-mockify-rowuuid'],
          megaBuffer = Buffer.concat(buffers),
          response = responsesToHandle[uuid];

      if (response) {
        // update the response data
        _.assign(response, {
          resHeaders: res_.headers,
          status: res_.statusCode,
          body: megaBuffer.toString('utf8')
        });
      }
    });
  });

  // if there is no response, the 'proxyRes' event is not triggered.
  // so we retrieve the statusCode here.
  proxy.on('end', function (req, res, proxyRes) {
    // do nothing if not recording the target
    if (!target.recording) {
      return;
    }

    var uuid = proxyRes.req._headers['x-mockify-rowuuid'],
        response = responsesToHandle[uuid];

    if (response) {
      // update the response data
      _.assign(response, {
        status: proxyRes.statusCode,
        end: 1
      });
    }

    var message = [
      proxyRes.statusCode,
      req.method,
      req.headers.host,
      req.url,
      proxyRes.req._headers.host,
      req.url
    ].join(';');

    // stdout captured by the main app
    logResponse(message);
  });
};

db.whenReady().then(function () {
  db.model('Target').get(targetId, function (err, target) {
    if (!target) {
      logError('The target has not been found.');
      exit();
    }

    startProxy(target);
  });
});
