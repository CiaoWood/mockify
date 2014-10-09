module.exports = function () {
  'use strict';

  var express        = require('express'),
      path           = require('path'),
      swig           = require('swig'),
      logger         = require('morgan'),
      compress       = require('compression'),
      favicon        = require('static-favicon'),
      methodOverride = require('method-override'),
      errorHandler   = require('errorhandler'),
      indexRouter    = require('./routes/index'),
      conf           = require('./../daemon/lib/conf'),
      apiRouter      = require('./routes/api');

  /**
   * Express configuration.
   */
  var app = express();
  var isDevelopment = app.get('env') === 'development';

  app.engine('html', swig.renderFile);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'html');

  app
    .use(compress())
    .use(favicon())
    .use(methodOverride())
    .use(express.static(path.join(__dirname, '..', 'www-build')))
    .use(indexRouter)
    .use('/api', apiRouter)
    .use(function (req, res) {
      res.status(404).render('404', {title: 'Not Found :('});
    })
    .use(function (err, res) {
      console.error(err.stack);
      res.send(500, 'Something is broken!');
    });

  var swigCache;
  if (isDevelopment) {
    app.use(logger('dev'));
    app.use(errorHandler());
    swigCache = false;
  } else {
    swigCache = 'memory';
  }

  // set the config in the layout, to be "readable" from Angular
  conf().read().then(function (config) {
    swig.setDefaults({
      cache: swigCache,
      locals: {
        config: JSON.stringify(config)
      }
    });
  });

  return app;
};
