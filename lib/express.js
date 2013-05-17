
var _ = require('underscore'),
    express = require('express'),
    lessMiddleware = require('less-middleware'),
    path = require('path');

var root = path.join(__dirname, '..');

var Express = function(config) {
  this.config = config || {};
  this.app = express();
  this.configure();
};

_.extend(Express.prototype, {

  configure : function() {

    var app = this.app;

    // all environments
    app.set('port', this.port());
    app.set('views', path.join(root, 'views'));
    app.set('view engine', 'jade');

    app.use(express.logger('dev'));

    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);

    // TODO: configure less middleware for production
    app.use(express.favicon());
    app.use(lessMiddleware({
      src: path.join(root, 'assets', 'less'),
      dest: path.join(root, 'public', 'css'),
      prefix: '/css',
      compress: true
    }));
    app.use(express.static(path.join(root, 'public')));

    // TODO: for reverse proxying
    //this.enable('trust proxy');

    // development only
    if ('development' == app.get('env')) {
      app.use(express.errorHandler());
    }
  },

  port : function() {
    return process.env.PORT || this.config.port || 3000;
  }
});

module.exports = Express;
