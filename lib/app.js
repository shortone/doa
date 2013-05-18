
var _ = require('underscore'),
    http = require('http'),
    path = require('path');

var Config = require('./config'),
    Express = require('./express'),
    Logger = require('./logger'),
    Router = require('./router');

var Application = function(options) {
  this.config = new Config(options);
  this.router = new Router(this, this.config);
  this.log = new Logger('app', this.config);
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
    this.log.info('DOA listening on port ' + this.get('port'));
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
