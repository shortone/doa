
var _ = require('underscore'),
    events = require('events'),
    util = require('util');

var Config = function(options) {
  events.EventEmitter.call(this);
  this.manualOptions = options || {};
  this.load();
};

util.inherits(Config, events.EventEmitter);

_.extend(Config.prototype, {

  load : function() {
    this.options = _.defaults({}, this.manualOptions, this.environmentOptions(), this.defaultOptions);
  },

  get : function(name) {
    return this.options[name];
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
  }
});

module.exports = Config;
