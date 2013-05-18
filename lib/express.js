
var _ = require('underscore'),
    assets = require('connect-assets'),
    express = require('express'),
    log4js = require('log4js'),
    namespace = require('express-namespace'),
    resource = require('express-resource'),
    path = require('path');

var root = path.join(__dirname, '..'),
    Logger = require('./logger');

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
    app.set('views', path.join(root, 'views'));
    app.set('view engine', 'jade');

    app.use(express.logger('dev'));
    app.use(log4js.connectLogger(this.log.logger, { level: log4js.levels.TRACE }));

    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);

    app.use(express.favicon());
    app.use(assets({
      buildDir: path.join(root, 'public')
    }));
    app.use(express.static(path.join(root, 'public')));

    // TODO: for reverse proxying
    //this.enable('trust proxy');

    // development only
    if ('development' == app.get('env')) {
      app.use(express.errorHandler());
    }
  },

  get : function(name) {
    return this.config.get(name);
  }
});

module.exports = Express;
