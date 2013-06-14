
var _ = require('underscore');

var levels = [ 'trace', 'debug', 'info', 'warn', 'error', 'fatal' ];

var Logger = function(name, config) {
  this.name = name;
  this.config = config;
  this.messages = [];
};

_.each(levels, function(level) {
  Logger.prototype[level] = function() {
    this.messages.push({ level : level, args : Array.prototype.slice.call(arguments) });
  };
});

module.exports = Logger;
