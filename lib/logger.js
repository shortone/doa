
var _ = require('underscore'),
    log4js = require('log4js');

var LEVELS = [ 'trace', 'debug', 'info', 'warn', 'error', 'fatal' ];

var Logger = function(name, config) {

  this.config = config;
  this.logger = log4js.getLogger(name);

  this.configure();
  this.config.on('change', _.bind(this.configure, this));
};

Logger.configure = function(config) {

  var appenders = [ { type: 'console' } ];

  if (config.get('logFile')) {
    appenders = [ { type: 'file', filename: config.get('logFile') } ];
  }

  log4js.configure({
    appenders: appenders
  });
};

_.extend(Logger.prototype, {

  configure : function() {

    var logLevel = this.logger.level.levelStr.toUpperCase(),
        newLogLevel = this.config.get('logLevel').toUpperCase();

    if (newLogLevel != logLevel) {
      this.logger.setLevel(newLogLevel);
    }
  }
});

_.each(LEVELS, function(level) {

  Logger.prototype[level] = function() {
    this.logger[level].apply(this.logger, Array.prototype.slice.call(arguments));
  };
});

module.exports = Logger;
