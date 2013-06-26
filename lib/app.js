
var _ = require('underscore'),
    async = require('async'),
    events = require('events'),
    fs = require('fs'),
    http = require('http'),
    path = require('path'),
    util = require('util');

var Config = require('./config'),
    Databases = require('./db'),
    Express = require('./express').inject(),
    Logger = require('./logger').inject(),
    Router = require('./router'),
    Scheduler = require('./scheduler'),
    Watchdog = require('./watchdog');

var Application = function(options) {

  this.config = new Config(options);

  Logger.configure(this.config);
  this.log = new Logger('app', this.config);

  this.express = new Express(this.config);
  this.router = new Router(this, this.config);
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
      _.bind(this.loadConfig, this),
      _.bind(this.savePid, this),
      _.bind(this.openDatabase, this),
      _.bind(this.startServer, this),
      _.bind(this.startWatchdog, this),
      _.bind(this.startScheduler, this),
      _.bind(this.trapSignals, this)
    ], callback);
  },

  loadConfig : function(callback) {
    this.config.load(_.bind(function(err) {
      if (err) {
        this.log.fatal('Could not load config: ' + err);
        return callback(err);
      }
      callback();
    }, this));
  },

  openDatabase : function(callback) {
    this.db = new Databases[this.config.get('db').type](this.config);
    this.db.open(_.bind(function(err) {
      if (err) {
        this.log.fatal('Could not open database: ' + err);
        return callback(err);
      }
      callback();
    }, this));
  },

  startServer : function(callback) {
    this.router.setup(this.express.app);
    this.server = http.createServer(this.express.app);
    this.server.listen(this.config.get('port'), _.bind(function(err) {
      if (err) {
        this.log.fatal('Could not start server: ' + err);
        return callback(err);
      }

      this.log.info('Listening on port ' + this.config.get('port'));
      callback();
    }, this));
  },

  savePid : function(callback) {
    if (!this.config.get('pidFile')) {
      return callback();
    }

    fs.writeFile(this.config.get('pidFile'), process.pid.toString(), _.bind(function(err) {
      if (err) {
        this.log.fatal('Could not save PID to ' + this.config.get('pidFile') + ': ' + err);
        return callback(err);
      }
      callback();
    }, this));
  },

  startWatchdog : function(callback) {
    this.on('watch', _.bind(this.watchdog.watch, this.watchdog));
    callback();
  },

  startScheduler : function(callback) {
    this.scheduler.start(_.bind(function(err) {
      if (err) {
        this.log.fatal('Could not start scheduler: ' + err);
        return callback(err);
      }
      callback();
    }, this));
  },

  trapSignals : function(callback) {
    // TODO: reload config on SIGHUP
    process.on('SIGINT', _.bind(this.stop, this));
    process.on('SIGQUIT', _.bind(this.stop, this));
    process.on('SIGTERM', _.bind(this.stop, this));
    callback();
  },

  stop : function(callback) {
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
    this.stop(_.bind(this.start, this));
  }
});

module.exports = Application;
