
exports.inject = function(deps) {
  deps = deps || {};

  var _ = require('underscore'),
      accept = deps.accept || require('http-accept'),
      assets = deps.assets || require('connect-assets'),
      express = deps.express || require('express'),
      http = deps.http || require('http'),
      i18next = deps.i18next || require('i18next'),
      log4js = deps.log4js || require('log4js'),
      namespace = require('express-namespace'),
      path = require('path'),
      Logger = deps.Logger || require('./logger').inject();

  var Express = function(app) {

    _.bindAll(this);

    this.router = app.router;
    this.expressApp = express();
    this.httpServer = http.createServer(this.expressApp);

    this.log = new Logger('express', app.config);
    app.config.on('change', _.bind(this.configure, this));
  };

  _.extend(Express.prototype, {

    start : function(callback) {
      this.httpServer.listen(this.expressApp.get('port'), _.bind(function(err) {
        this.started(err, callback);
      }, this));
    },

    started : function(err, callback) {
      if (err) {
        return callback(new Error("Could not start express server: " + err));
      }

      this.log.info('Listening on port ' + this.expressApp.get('port'));
      callback();
    },

    configure : function(config) {

      var app = this.expressApp;

      app.set('env', config.get('env'));

      // all environments
      app.set('port', config.get('port'));
      app.set('views', path.join(__dirname, 'views'));
      app.set('view engine', 'jade');

      app.configure('development', function() {
        app.use(express.logger('dev'));
      });

      app.use(log4js.connectLogger(this.log.logger, { level: log4js.levels.TRACE }));

      app.use(accept);
      app.use(express.bodyParser());
      app.use(express.methodOverride());

      var localeFilePath = path.join(__dirname, '..', 'locales', '__lng__.json');
      this.log.debug('Configuring i18next to load translations from ' + localeFilePath);
      i18next.init({ fallbackLng : 'en', resGetPath : localeFilePath });
      app.use(i18next.handle);

      app.use(app.router);

      app.use(express.favicon());
      app.use(assets({
        src : path.join(__dirname, 'assets'),
        buildDir : false // TODO: need config setting to set assets build dir
      }));

      var staticAssetsPath = path.join(__dirname, '..', 'public');
      this.log.debug('Configure static assets to be loaded from ' + staticAssetsPath);
      app.use(express.static(staticAssetsPath));

      if (config.get('proxy')) {
        app.enable('trust proxy');
      }

      // development only
      app.configure('development', function() {
        app.use(express.errorHandler());
      });

      i18next.registerAppHelper(app);

      this.router.setup(app);
    }
  });

  return Express;
};
