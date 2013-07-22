
var _ = require('underscore'),
    events = require('events'),
    util = require('util');

var Config = function(options) {
  events.EventEmitter.call(this);
  this.options = options;
};

util.inherits(Config, events.EventEmitter);

_.extend(Config.prototype, {

  get : function(name) {
    return this.options[name];
  },

  change : function(options) {
    this.options = _.extend(this.options, options || {});
    this.emit('change', this);
  }
});

module.exports = Config;
