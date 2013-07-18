
var _ = require('underscore'),
    assets = require('connect-assets'),
    express = require('express'),
    log4js = require('log4js'),
    path = require('path');

var appRoot = path.resolve(path.join(__dirname, '..'));

var mockData = {
};

var clearMockData = function() {
  mockData.middlewares = {};
};

var fakeMiddleware = function(name, original) {
  return function() {
    var args = Array.prototype.slice.call(arguments);
    var middleware = original(args);
    mockData.middlewares[name] = { func : middleware, args : args };
    return middleware;
  };
};

var expressMock = function() {
  var obj = express();
  spyOn(obj, 'use').andCallThrough();
  return obj;
};

_.each([ 'logger', 'bodyParser', 'methodOverride', 'static', 'favicon', 'errorHandler' ], function(name) {
  expressMock[name] = fakeMiddleware(name, express[name]);
});

var acceptMock = jasmine.createSpy(),
    assetsMock = fakeMiddleware('assets', assets);

var log4jsMock = {
  connectLogger : fakeMiddleware('log4js', log4js.connectLogger),
  levels : log4js.levels
};

var Config = require('./support/mocks/config'),
    Logger = require('./support/mocks/logger'),
    matchers = require('./support/matchers'),
    AppExpress = require('../lib/express').inject({
      accept : acceptMock,
      assets : assetsMock,
      express : expressMock,
      log4js : log4jsMock,
      Logger : Logger
    });

var newAppExpress = function(options) {

  var config = new Config(_.extend({
    env : 'development',
    port : 3000,
    logLevel : 'debug'
  }, options || {}));

  // TODO: spec router setup call
  var appExpress = new AppExpress({ config : config, router : { setup : function() {} } });
  config.change();
  return appExpress;
};

describe("Express", function() {
  // TODO: spec start/stop

  var appExpress;

  beforeEach(function() {
    clearMockData();
  });

  it("should use the configured port", function() {
    expect(newAppExpress({ port : 1234 }).expressApp.get('port')).toEqual(1234);
  });

  it("should serve views from the views directory", function() {
    expect(newAppExpress().expressApp.get('views')).toEqual(path.join(appRoot, 'lib', 'views'));
  });

  it("should use jade as the view engine", function() {
    expect(newAppExpress().expressApp.get('view engine')).toEqual('jade');
  });

  it("should not trust proxies by default", function() {
    expect(newAppExpress().expressApp.enabled('trust proxy')).toBe(false);
  });

  it("should trust proxies if configured", function() {
    expect(newAppExpress({ proxy : true }).expressApp.enabled('trust proxy')).toBe(true);
  });

  it("should use the configured environment", function() {
    expect(newAppExpress({ env : 'staging' }).expressApp.get('env')).toEqual('staging');
  });

  it("should use the express dev logger in development", function() {
    newAppExpress();
    expect(mockData.middlewares.logger.args).toEqual([ 'dev' ]);
  });

  it("should use the log4js connect logger with the TRACE level", function() {
    var appExpress = newAppExpress();
    expect(mockData.middlewares.log4js.args).toEqual([ appExpress.log.logger, { level : log4js.levels.TRACE } ]);
  });

  it("should configure the assets manager with the correct path", function() {
    newAppExpress();
    expect(mockData.middlewares.assets.args[0].src).toEqual(path.join(appRoot, 'lib', 'assets'));
  });

  it("should configure the static middleware with the correct path", function() {
    newAppExpress();
    expect(mockData.middlewares.static.args).toEqual([ path.join(appRoot, 'public') ]);
  });

  // TODO: mock and spec buildDir
  /*it("should log the buildDir when specified", function() {
    expect(newAppExpress().log).toHaveLogged('debug', path.join(appRoot, 'public'));
  });*/

  it("should use development middlewares in the correct order", function() {
    var app = newAppExpress().expressApp;
    expect(app.use.argsForCall).toEqual([
      [ mockData.middlewares.logger.func ],
      [ mockData.middlewares.log4js.func ],
      [ acceptMock ],
      [ mockData.middlewares.bodyParser.func ],
      [ mockData.middlewares.methodOverride.func ],
      [ app.router ],
      [ mockData.middlewares.favicon.func ],
      [ mockData.middlewares.assets.func ],
      [ mockData.middlewares.static.func ],
      [ mockData.middlewares.errorHandler.func ]
    ]);
  });

  it("should use production middlewares in the correct order", function() {
    var app = newAppExpress({ env : 'production' }).expressApp;
    expect(app.use.argsForCall).toEqual([
      [ mockData.middlewares.log4js.func ],
      [ acceptMock ],
      [ mockData.middlewares.bodyParser.func ],
      [ mockData.middlewares.methodOverride.func ],
      [ app.router ],
      [ mockData.middlewares.favicon.func ],
      [ mockData.middlewares.assets.func ],
      [ mockData.middlewares.static.func ]
    ]);
  });
});
