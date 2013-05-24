
var _ = require('underscore'),
    http = require('http'),
    path = require('path');

var Config = require('./config'),
    Databases = require('./db'),
    Express = require('./express'),
    Logger = require('./logger'),
    Router = require('./router'),
    Watchdog = require('./watchdog');

var Application = function(options) {
  this.config = new Config(options);
  this.log = new Logger('app', this.config);
  this.router = new Router(this, this.config);
  this.db = new Databases[this.get('db').type](this.config);
  this.watchdog = new Watchdog(this.db, this.config);
};

_.extend(Application.prototype, {

  version : require(path.join('..', 'package')).version,

  start : function() {

    if (this.server) {
      throw new Error('Server has already started');
    }

    this.server = http.createServer(this.express());
    this.server.listen(this.get('port'), _.bind(this.started, this));
  },

  started : function() {
    this.log.info('Listening on port ' + this.get('port'));
    this.watchdog.start();
  },

  stop : function(callback) {
    this.server.close(callback);
  },

  restart : function() {
    this.stop(_.bind(this.start, this));
  },

  express : function() {

    var express = new Express(this.config),
        app = express.app;

    return this.router.setup(app);
  },

  get : function(name) {
    return this.config.get(name);
  }
});

module.exports = Application;
