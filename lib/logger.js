
var _ = require('underscore'),
    log4js = require('log4js');

var Logger = function(name, config) {
  this.logger = log4js.getLogger(name);
  config.on('change', _.bind(this.configure, this));
};

Logger.levels = [ 'trace', 'debug', 'info', 'warn', 'error', 'fatal' ];

Logger.configure = function(config) {
  config.on('change', function(config) {
    Logger.applyConfiguration(config);
  });
};

Logger.applyConfiguration = function(config) {

  var appenders = [ { type: 'console' } ];

  if (config.get('logFile')) {
    appenders = [ { type: 'file', filename: config.get('logFile') } ];
  }

  log4js.configure({
    appenders: appenders
  });
};

_.extend(Logger.prototype, {

  configure : function(config) {

    var logLevel = this.logger.level.levelStr.toUpperCase(),
        newLogLevel = config.get('logLevel').toUpperCase();

    if (newLogLevel != logLevel) {
      this.logger.setLevel(newLogLevel);
    }
  },

  getLevel : function() {
    return this.logger.level.levelStr.toLowerCase();
  }
});

_.each(Logger.levels, function(level) {

  Logger.prototype[level] = function() {
    this.logger[level].apply(this.logger, Array.prototype.slice.call(arguments));
  };
});

module.exports = Logger;
