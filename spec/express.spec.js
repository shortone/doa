
var _ = require('underscore'),
    assets = require('connect-assets'),
    express = require('express'),
    i18n = require('i18next'),
    log4js = require('log4js'),
    path = require('path'),
    sandbox = require('sandboxed-module');

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

var assetsMock = fakeMiddleware('assets', assets);

var log4jsMock = {
  connectLogger : fakeMiddleware('log4js', log4js.connectLogger),
  levels : log4js.levels
};

var i18nMock = jasmine.createSpyObj('i18n', [ 'init', 'registerAppHelper' ]);
i18nMock.handle = function() {};

var Config = require('./support/mocks/config'),
    Logger = require('./support/mocks/logger'),
    matchers = require('./support/matchers'),
    AppExpress = sandbox.require('../lib/express', {
      requires : {
        'connect-assets' : assetsMock,
        express : expressMock,
        i18next : i18nMock,
        log4js : log4jsMock,
        './logger' : Logger
      }
    });

var newAppExpress = function(options) {

  var config = new Config(_.extend({
    env : 'development',
    port : 3000,
    logLevel : 'debug'
  }, options || {}));

  var appExpress = new AppExpress(config);
  config.change();
  return appExpress;
};

describe("Express", function() {

  var appExpress;

  beforeEach(function() {
    clearMockData();
  });

  it("should use the configured port", function() {
    expect(newAppExpress({ port : 1234 }).app.get('port')).toEqual(1234);
  });

  it("should serve views from the views directory", function() {
    expect(newAppExpress().app.get('views')).toEqual(path.join(appRoot, 'lib', 'views'));
  });

  it("should use jade as the view engine", function() {
    expect(newAppExpress().app.get('view engine')).toEqual('jade');
  });

  it("should not trust proxies by default", function() {
    expect(newAppExpress().app.enabled('trust proxy')).toBe(false);
  });

  it("should trust proxies if configured", function() {
    expect(newAppExpress({ proxy : true }).app.enabled('trust proxy')).toBe(true);
  });

  it("should use the configured environment", function() {
    expect(newAppExpress({ env : 'staging' }).app.get('env')).toEqual('staging');
  });

  it("should use the express dev logger in development", function() {
    newAppExpress();
    expect(mockData.middlewares.logger.args).toEqual([ 'dev' ]);
  });

  it("should use the log4js connect logger with the TRACE level", function() {
    var appExpress = newAppExpress();
    expect(mockData.middlewares.log4js.args).toEqual([ appExpress.log.logger, { level : log4js.levels.TRACE } ]);
  });

  it("should initialize i18next with the correct language and path", function() {
    newAppExpress();
    expect(i18nMock.init).toHaveBeenCalledWith({
      fallbackLng : 'en',
      resGetPath : path.join(appRoot, 'locales', '__lng__.json')
    });
  });

  it("should register the i18next app helper", function() {
    var app = newAppExpress().app;
    expect(i18nMock.registerAppHelper).toHaveBeenCalledWith(app);
  });

  it("should configure the assets manager with the correct path", function() {
    newAppExpress();
    expect(mockData.middlewares.assets.args[0].src).toEqual(path.join(appRoot, 'lib', 'assets'));
  });

  it("should configure the static middleware with the correct path", function() {
    newAppExpress();
    expect(mockData.middlewares.static.args).toEqual([ path.join(appRoot, 'public') ]);
  });

  it("should log the path to translations", function() {
    expect(newAppExpress().log).toHaveLogged('debug', path.join(appRoot, 'locales', '__lng__.json'));
  });

  it("should log the path to static assets", function() {
    expect(newAppExpress().log).toHaveLogged('debug', path.join(appRoot, 'public'));
  });

  it("should use development middlewares in the correct order", function() {
    var app = newAppExpress().app;
    expect(app.use.argsForCall).toEqual([
      [ mockData.middlewares.logger.func ],
      [ mockData.middlewares.log4js.func ],
      [ mockData.middlewares.bodyParser.func ],
      [ mockData.middlewares.methodOverride.func ],
      [ i18nMock.handle ],
      [ app.router ],
      [ mockData.middlewares.favicon.func ],
      [ mockData.middlewares.assets.func ],
      [ mockData.middlewares.static.func ],
      [ mockData.middlewares.errorHandler.func ]
    ]);
  });

  it("should use production middlewares in the correct order", function() {
    var app = newAppExpress({ env : 'production' }).app;
    expect(app.use.argsForCall).toEqual([
      [ mockData.middlewares.log4js.func ],
      [ mockData.middlewares.bodyParser.func ],
      [ mockData.middlewares.methodOverride.func ],
      [ i18nMock.handle ],
      [ app.router ],
      [ mockData.middlewares.favicon.func ],
      [ mockData.middlewares.assets.func ],
      [ mockData.middlewares.static.func ]
    ]);
  });
});
