
var _ = require('underscore'),
    async = require('async'),
    events = require('events'),
    fs = require('fs'),
    path = require('path'),
    util = require('util');

var Config = require('./config'),
    Databases = require('./db'),
    Express = require('./express').inject(),
    Logger = require('./logger').inject(),
    Router = require('./router'),
    Scheduler = require('./scheduler').inject(),
    Watchdog = require('./watchdog');

// web resources
var Home = require('./res/home'),
    Watches = require('./res/watches');

var Application = function(options) {

  _.bindAll(this);

  this.config = new Config(options);

  Logger.configure(this.config);
  this.log = new Logger('app', this.config);

  this.router = new Router(this, {
    home : new Home(this),
    watches : new Watches(this)
  });

  this.express = new Express(this);
  this.scheduler = new Scheduler(this);
  this.watchdog = new Watchdog(this);
};

util.inherits(Application, events.EventEmitter);

_.extend(Application.prototype, {

  version : require(path.join('..', 'package')).version,

  start : function(callback) {

    if (this.server) {
      return callback('Server has already started');
    }

    async.series([
      this.config.load,
      this.savePid,
      this.createDatabase,
      this.openDatabase,
      this.express.start,
      this.scheduler.start,
      this.trapSignals
    ], this.started);
  },

  started : function(err) {
    if (err) {
      this.log.fatal(err);
      return this.stop(1);
    }
    this.log.info('Application started successfully');
  },

  createDatabase : function(callback) {
    this.db = new Databases[this.config.get('db').type](this.config);
    callback();
  },

  openDatabase : function(callback) {
    this.db.open(callback);
  },

  savePid : function(callback) {

    var pidFile = this.config.get('pidFile');
    if (!pidFile) {
      return callback();
    }

    fs.writeFile(pidFile, process.pid.toString(), function(err) {
      if (err) {
        return callback(new Error("Could not save PID to " + pidFile + ": " + err));
      }
      // TODO: log PID file successfully saved
      callback();
    });
  },

  trapSignals : function(callback) {
    // TODO: reload config on SIGHUP
    process.on('SIGINT', _.bind(this.stop, this, 0));
    process.on('SIGQUIT', _.bind(this.stop, this, 0));
    process.on('SIGTERM', _.bind(this.stop, this, 0));
    callback();
  },

  stop : function(exit, callback) {
    async.series([
      _.bind(this.stopScheduler, this),
      _.bind(this.stopServer, this),
      _.bind(this.closeDatabase, this),
      _.bind(this.deletePidFile, this)
    ], _.bind(function(err) {
      if (err) {
        this.log.error('Could not stop application: ' + err);
      }

      delete this.server;
      this.log.info('Application stopped');

      if (callback) {
        callback();
      }

      if (_.isNumber(exit)) {
        process.exit(exit);
      }
    }, this));
  },

  stopScheduler : function(callback) {
    this.scheduler.stop(_.bind(function(err) {
      if (err) {
        this.log.error('Could not stop scheduler: ' + err);
      }
      callback();
    }, this));
  },

  stopServer : function(callback) {
    try {
      this.server.close(_.bind(function(err) {
        if (err) {
          this.log.error('Could not stop server: ' + err);
        }
        callback();
      }, this));
    } catch(err) {
      callback();
    }
  },

  closeDatabase : function(callback) {
    this.db.close(_.bind(function(err) {
      if (err) {
        this.log.error('Could not close database: ' + err);
      }
      callback();
    }, this));
  },

  deletePidFile : function(callback) {
    if (!this.config.get('pidFile')) {
      return callback();
    }

    fs.unlink(this.config.get('pidFile'), _.bind(function(err) {
      if (err) {
        this.log.error('Could not delete PID file ' + this.config.get('pidFile') + ': ' + err);
      }
      callback();
    }, this));
  },

  restart : function() {
    this.stop(false, _.bind(this.start, this));
  }
});

module.exports = Application;
