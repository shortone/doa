
var _ = require('underscore'),
    events = require('events'),
    fs = require('fs'),
    path = require('path'),
    util = require('util'),
    yaml = require('js-yaml');

var Config = function(options) {

  events.EventEmitter.call(this);

  this.options = {};
  this.manualOptions = options || {};

  this.get = function() {
    throw new Error('Not yet loaded');
  };
};

util.inherits(Config, events.EventEmitter);

_.extend(Config.prototype, {

  load : function(callback) {

    this.options = _.defaults({}, this.manualOptions, this.environmentOptions());

    this.fileOptions(_.bind(function(err, fileOptions) {
      if (err) {
        return callback(err);
      }

      this.options = _.defaults(this.options, fileOptions, this.defaultOptions);

      delete this.get;
      this.emit('change', this);

      callback();
    }, this));
  },

  get : function(name) {
    return this.options[name];
  },

  fileOptions : function(callback) {

    var path = this.filePath();
    fs.exists(path, function(exists) {
      if (!exists) {
        return callback(undefined, {});
      }

      fs.readFile(path, { encoding : 'utf-8' }, function(err, raw) {
        if (err) {
          return callback(err);
        }

        try {
          return callback(undefined, yaml.safeLoad(raw));
        } catch(err2) {
          return callback(err2);
        }
      });
    });
  },

  defaultOptions : {
    env : 'development',
    port : 3000,
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

  filePath : function() {
    return this.options.config || path.join(process.cwd(), 'doa.yml');
  }
});

module.exports = Config;
