
var _ = require('underscore'),
    async = require('async'),
    events = require('events'),
    fs = require('fs'),
    path = require('path'),
    util = require('util'),
    yaml = require('js-yaml');

var Config = function(options) {

  events.EventEmitter.call(this);
  _.bindAll(this);

  this.options = {};
  this.manualOptions = options || {};

  this.get = function() {
    throw new Error('Not yet loaded');
  };
};

util.inherits(Config, events.EventEmitter);

_.extend(Config.prototype, {

  load : function(callback) {
    async.waterfall([
      this.loadBaseOptions,
      this.loadFileOptions,
      this.applyOptions
    ], callback);
  },

  get : function(name) {
    return this.options[name];
  },

  loadBaseOptions : function(callback) {
    callback(undefined, _.defaults({}, this.manualOptions, this.environmentOptions()));
  },

  applyOptions : function(baseOptions, fileOptions, callback) {

    this.options = _.defaults(baseOptions, fileOptions, this.defaultOptions);

    delete this.get;
    this.emit('change', this);

    callback();
  },

  loadFileOptions : function(baseOptions, callback) {

    var path = this.filePath(baseOptions);
    fs.exists(path, function(exists) {
      if (!exists) {
        return callback(undefined, baseOptions, {});
      }

      fs.readFile(path, { encoding : 'utf-8' }, function(err, raw) {
        if (err) {
          return callback(new Error("Could not read config file " + path + ": " + err));
        }

        try {
          callback(undefined, baseOptions, yaml.safeLoad(raw));
        } catch(parseErr) {
          callback(new Error("Could not parse config file " + path + ": " + parseErr));
        }
      });
    });
  },

  defaultOptions : {
    env : 'development',
    port : 3000,
    buildDir : false,
    logLevel : 'debug',
    db : {
      type : 'memory'
    }
  },

  environmentOptions : function() {
    return {
      env : process.env.NODE_ENV,
      config : process.env.CONFIG,
      port : process.env.PORT ? parseInt(process.env.PORT, 10) : undefined
    };
  },

  filePath : function(options) {
    return options.config || path.join(process.cwd(), 'doa.yml');
  }
});

module.exports = Config;
