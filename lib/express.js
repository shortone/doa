
var _ = require('underscore'),
    express = require('express'),
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
    app.set('port', process.env.PORT || 3000);
    app.set('views', path.join(root, 'views'));
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(root, 'public')));

    // TODO: for reverse proxying
    //this.enable('trust proxy');

    // development only
    if ('development' == app.get('env')) {
      app.use(express.errorHandler());
    }
  }
});

module.exports = Express;
