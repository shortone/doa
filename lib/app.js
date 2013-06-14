
var _ = require('underscore'),
    events = require('events'),
    fs = require('fs'),
    http = require('http'),
    path = require('path'),
    util = require('util');

var Config = require('./config'),
    Databases = require('./db'),
    Express = require('./express'),
    Logger = require('./logger'),
    Router = require('./router'),
    Scheduler = require('./scheduler');

var Application = function(options) {

  this.config = new Config(options);

  Logger.configure(this.config);
  this.log = new Logger('app', this.config);

  this.express = new Express(this.config);
  this.router = new Router(this, this.config);
  this.scheduler = new Scheduler(this);
};

util.inherits(Application, events.EventEmitter);

_.extend(Application.prototype, {

  version : require(path.join('..', 'package')).version,

  start : function() {

    if (this.server) {
      throw new Error('Server has already started');
    }

    this.config.load(_.bind(function(err) {
      if (err) {
        return this.log.fatal('Could not load config: ' + err);
      }

      this.router.setup(this.express.app);
      this.db = new Databases[this.get('db').type](this.config);
      this.server = http.createServer(this.express.app);

      this.savePid(_.bind(function(err) {
        if (err) {
          return this.log.fatal('Could not save PID to ' + this.get('pidFile') + ': ' + err);
        }

        this.server.listen(this.get('port'), _.bind(this.started, this));
      }, this));
    }, this));
  },

  savePid : function(callback) {
    if (!this.get('pidFile')) {
      return callback();
    }

    fs.writeFile(this.get('pidFile'), process.pid.toString(), callback);
  },

  started : function(err) {
    if (err) {
      return this.log.fatal('Could not start server: ' + err);
    }

    this.log.info('Listening on port ' + this.get('port'));
    this.scheduler.start();

    this.trapSignals();
  },

  stop : function(callback) {
    this.log.debug('Stopping server...');
    this.server.close(_.bind(this.serverClosed, this, callback));
  },

  serverClosed : function(callback) {
    if (!this.get('pidFile')) {
      return this.stopped(callback);
    }

    this.log.debug('Deleting PID file ' + this.get('pidFile'));

    fs.unlink(this.get('pidFile'), function(err) {
      if (err) {
        return this.log.error('Could not delete PID file: ' + err);
      }
      this.stopped(callback);
    });
  },

  stopped : function(callback) {
    this.log.info('Application stopped');
  },

  restart : function() {
    this.stop(_.bind(this.start, this));
  },

  trapSignals : function() {
    // TODO: reload config on SIGHUP
    process.on('SIGINT', _.bind(this.stop, this));
    process.on('SIGQUIT', _.bind(this.stop, this));
    process.on('SIGTERM', _.bind(this.stop, this));
  },

  get : function(name) {
    return this.config.get(name);
  }
});

module.exports = Application;
