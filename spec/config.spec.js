
var _ = require('underscore'),
    fs = require('fs-extra'),
    path = require('path'),
    temp = require('temp');

var matchers = require('./support/matchers'),
    Config = require('../lib/config');

var tmpDir = temp.mkdirSync(),
    tmpFile = path.join(tmpDir, 'doa.yml');

var testConfig = function(options, callback) {

  var loaded = false,
      config = new Config(options);

  runs(function() {
    config.load(function() {
      loaded = true;
    });
  });

  waitsFor(function() {
    return loaded;
  }, "The configuration should be loaded", 250);

  runs(function() {
    callback(config);
  });
};

describe("Config", function() {

  beforeEach(function() {
    _.each([ 'NODE_ENV', 'CONFIG', 'PORT' ], function(name) { delete process.env[name]; });
  });

  it("should throw errors when not loaded", function() {
    try {
      new Config().get('foo');
      this.fail('Expected configuration to throw error when not loaded');
    } catch(err) {
    }
  });

  it("should emit a change event after loading", function() {

    var received = null,
        config = new Config();

    config.on('change', function(c) {
      received = c || true;
    });

    runs(function() {
      config.load(function() {});
    });

    waitsFor(function() {
      return received;
    }, "The change event should have been emitted", 250);

    runs(function() {
      expect(received).toBe(config);
    });
  });

  it("should have the correct default options", function() {
    testConfig({}, function(config) {
      expect(config).toHaveOptions({
        env : 'development',
        port : 3000,
        logLevel : 'debug',
        db : {
          type : 'memory'
        }
      });
    });
  });

  it("should use manually specified options", function() {

    var options = {
      foo : 'bar',
      env : 'staging',
      config : '/tmp/doa.yml',
      port : 1234,
      logLevel : 'warn',
      logFile : '/tmp/doa.log',
      db : {
        type : 'yaml',
        file : '/tmp/doa.db'
      }
    };

    testConfig(options, function(config) {
      expect(config).toHaveOptions(options);
    });
  });

  it("should use environment options", function() {

    process.env.NODE_ENV = 'staging';
    process.env.CONFIG = '/tmp/doa.yml';
    process.env.PORT = '1234';

    testConfig({}, function(config) {
      expect(config).toHaveOptions({ env : 'staging', config : '/tmp/doa.yml', port : 1234 });
    });
  });

  it("should read the specified config file", function() {

    fs.writeFileSync(tmpFile,
      "---\nfoo: bar\nenv: staging\nport: 1234\nlogLevel: warn\nlogFile: /tmp/doa.log\ndb:\n  type: yaml\n  file: /tmp/doa.db",
      { encoding : 'utf-8' });

    testConfig({ config : tmpFile }, function(config) {
      expect(config).toHaveOptions({
        foo : 'bar',
        env : 'staging',
        port : 1234,
        logLevel : 'warn',
        logFile : '/tmp/doa.log',
        db : {
          type : 'yaml',
          file : '/tmp/doa.db'
        }
      });
    });
  });

  it("should read the config file in the current directory by default", function() {

    fs.writeFileSync(tmpFile, "env: staging\nport: 1234", { encoding : 'utf-8' });
    process.chdir(tmpDir);

    testConfig({ tmpFile : tmpFile }, function(config) {
      expect(config).toHaveOptions({ env : 'staging', port : 1234 });
    });
  });

  it("should read the config file specified by the CONFIG environment variable", function() {

    fs.writeFileSync(tmpFile, "env: production\nport: 1234", { encoding : 'utf-8' });
    process.env.CONFIG = tmpFile;

    testConfig({}, function(config) {
      expect(config).toHaveOptions({ env : 'production', port : 1234 });
    });
  });

  it("should ignored malformed files", function() {

    fs.writeFileSync(tmpFile, "port 1234\nenv = staging", { encoding : 'utf-8' });

    testConfig({ config : tmpFile }, function(config) {
      expect(config).toHaveOptions({
        env : 'development',
        port : 3000,
        logLevel : 'debug',
        db : {
          type : 'memory'
        }
      });
    });
  });

  it("should override environment options with manual options", function() {

    process.env.PORT = '1234';

    testConfig({ port : 2345 }, function(config) {
      expect(config).toHaveOptions({ port : 2345 });
    });
  });

  it("should override file options with environment options", function() {

    fs.writeFileSync(tmpFile, "port: 3456", { encoding : 'utf-8' });
    process.env.PORT = '4567';

    testConfig({ config : tmpFile }, function(config) {
      expect(config).toHaveOptions({ port : 4567 });
    });
  });

  it("should override default options with file options", function() {

    fs.writeFileSync(tmpFile, "port: 5678", { encoding : 'utf-8' });

    testConfig({ config : tmpFile }, function(config) {
      expect(config).toHaveOptions({ port : 5678 });
    });
  });
});
