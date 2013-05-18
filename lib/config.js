
var _ = require('underscore'),
    events = require('events');

var Config = function(options) {
  events.EventEmitter.call(this);
  this.manualOptions = options || {};
  this.load();
};

_.extend(Config.prototype, {

  load : function() {
    this.options = _.defaults({}, this.manualOptions, this.environmentOptions(), this.defaultOptions);
  },

  get : function(name) {
    return this.options[name];
  },

  defaultOptions : {
    port : 3000,
    logLevel : 'debug'
  },

  environmentOptions : function() {
    return {
      config : process.env.CONFIG,
      port : process.env.PORT
    };
  }
});

Config.prototype.__proto__ = events.EventEmitter.prototype;

module.exports = Config;
