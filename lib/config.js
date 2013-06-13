
var _ = require('underscore'),
    events = require('events'),
    fs = require('fs'),
    path = require('path'),
    util = require('util'),
    yaml = require('js-yaml');

var Config = function(options) {
  events.EventEmitter.call(this);
  this.manualOptions = options || {};
  this.load();
};

util.inherits(Config, events.EventEmitter);

_.extend(Config.prototype, {

  load : function() {
    this.options = _.defaults({}, this.manualOptions, this.environmentOptions());
    this.options = _.defaults(this.options, this.fileOptions(), this.defaultOptions);
  },

  get : function(name) {
    return this.options[name];
  },

  fileOptions : function() {

    var path = this.filePath();
    if (!fs.existsSync(path)) {
      return {};
    }

    return yaml.safeLoad(fs.readFileSync(path, { encoding : 'utf-8' }));
  },

  defaultOptions : {
    port : 3000,
    logLevel : 'debug',
    db : {
      type : 'memory'
    }
  },

  environmentOptions : function() {
    return {
      config : process.env.CONFIG,
      port : process.env.PORT
    };
  },

  filePath : function() {
    return this.options.config || path.join(process.cwd(), 'doa.yml');
  }
});

module.exports = Config;
