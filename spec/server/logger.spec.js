
var _ = require('underscore');

var mockData = {
};

clearMockData = function() {
  mockData.config = null;
  mockData.loggers = [];
};

var currentLogger;

var log4jsMock = {

  getLogger : function(name) {

    var loggerMock = jasmine.createSpyObj('logger', [ 'trace', 'debug', 'info', 'warn', 'error', 'fatal' ]);

    loggerMock.level = { levelStr : 'DEBUG' };
    loggerMock.setLevel = function(level) {
      loggerMock.level = { levelStr : level.toUpperCase() };
    };

    spyOn(loggerMock, 'setLevel').andCallThrough();

    mockData.loggers.push(name);
    currentLogger = loggerMock;

    return loggerMock;
  },

  configure : function(config) {
    mockData.config = config;
  }
};

var Config = require('./support/mocks/config'),
    Logger = require('../../lib/logger').inject({
      log4js : log4jsMock
    });

var newLogger = function(name, options) {

  var config = new Config(_.extend({
    logLevel : 'debug'
  }, options || {}));

  var mocks = {
    config : config,
    logger : new Logger(name, config)
  };

  config.change();

  return mocks;
};

describe("Logger", function() {

  beforeEach(function() {
    clearMockData();
  });

  it("should configure a console appender by default", function() {
    var config = new Config({ logLevel : 'debug' });
    Logger.configure(config);
    config.change();
    expect(mockData.config).toEqual({ appenders : [ { type : 'console' } ] });
  });

  it("should configure a file appender if a log file is specified", function() {
    var config = new Config({ logLevel : 'debug', logFile : '/tmp/foo.log' });
    Logger.configure(config);
    config.change();
    expect(mockData.config).toEqual({ appenders : [ { type : 'file', filename : '/tmp/foo.log' } ] });
  });

  it("should update the appenders when the configuration changes", function() {

    var config = new Config({ logLevel : 'debug' });

    Logger.configure(config);
    config.change();
    expect(mockData.config).toEqual({ appenders : [ { type : 'console' } ] });

    config.change({ logFile : '/tmp/foo.log' });
    expect(mockData.config).toEqual({ appenders : [ { type : 'file', filename : '/tmp/foo.log' } ] });

    config.change({ logFile : '/tmp/bar.log' });
    expect(mockData.config).toEqual({ appenders : [ { type : 'file', filename : '/tmp/bar.log' } ] });
  });

  it("should create an internal logger with the given name", function() {
    newLogger('foo');
    expect(mockData.loggers).toEqual([ 'foo' ]);
  });

  it("should use the configured log level", function() {
    expect(newLogger('foo', { logLevel : 'warn' }).logger.getLevel()).toEqual('warn');
  });

  it("should set the internal logger's level when created", function() {
    newLogger('foo', { logLevel : 'error' });
    expect(currentLogger.setLevel).toHaveBeenCalledWith('ERROR');
  });

  it("should update the log level when the configuration changes", function() {
    var mocks = newLogger('foo', { logLevel : 'debug' });
    currentLogger.setLevel.reset();
    mocks.config.change({ logLevel : 'info' });
    expect(currentLogger.setLevel).toHaveBeenCalledWith('INFO');
  });

  it("should not update the log level when the configuration hasn't changed", function() {
    var mocks = newLogger('foo', { logLevel : 'debug' });
    currentLogger.setLevel.reset();
    mocks.config.change({ logLevel : 'debug' });
    expect(currentLogger.setLevel).not.toHaveBeenCalled();
  });

  _.each([ 'trace', 'debug', 'info', 'warn', 'error', 'fatal' ], function(level) {

    it("should log " + level + " messages with the internal logger", function() {
      newLogger('foo').logger[level]('bar');
      expect(currentLogger[level]).toHaveBeenCalledWith('bar');
    });
  });
});
