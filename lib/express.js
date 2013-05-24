
var _ = require('underscore'),
    assets = require('connect-assets'),
    express = require('express'),
    i18n = require('i18next'),
    log4js = require('log4js'),
    namespace = require('express-namespace'),
    path = require('path');

var Logger = require('./logger');

var Express = function(config) {

  this.config = config;
  this.log = new Logger('express', this.config);

  this.configure();
  this.config.on('change', _.bind(this.configure, this));
};

_.extend(Express.prototype, {

  configure : function() {

    var app = this.app = express();

    // all environments
    app.set('port', this.get('port'));
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');

    app.use(express.logger('dev'));
    app.use(log4js.connectLogger(this.log.logger, { level: log4js.levels.TRACE }));

    app.use(express.bodyParser());
    app.use(express.methodOverride());

    i18n.init({ fallbackLng : 'en', resGetPath : path.join(__dirname, '..', 'locales', '__lng__.json') });
    app.use(i18n.handle);

    app.use(app.router);

    app.use(express.favicon());
    app.use(assets({
      src : path.join(__dirname, 'assets'),
      buildDir : false // TODO: need config setting to set assets build dir
    }));
    app.use(express.static(path.join(__dirname, '..', 'public')));

    // TODO: allow reverse proxying
    //this.enable('trust proxy');

    // development only
    if ('development' == app.get('env')) {
      app.use(express.errorHandler());
    }

    i18n.registerAppHelper(app);
  },

  get : function(name) {
    return this.config.get(name);
  }
});

module.exports = Express;
