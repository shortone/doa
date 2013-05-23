
var _ = require('underscore');

var MemoryDb = function(config) {
  this.config = config;
  this.watches = [
    {
      title : 'Website',
      token : 'abc',
      status : 'up',
      interval : 'hourly'
    },
    {
      title : 'Mail Server',
      token : 'def',
      status : 'down',
      interval : 'hourly'
    },
    {
      title : 'Monitoring Tool',
      token : 'ghi',
      status : 'new',
      interval : 'hourly'
    }
  ];
};

_.extend(MemoryDb.prototype, {

  addWatch : function(watch, callback) {
    this.watches.push(watch);
    callback(undefined, watch);
  },

  removeWatch : function(token, callback) {
    this.watches = _.reject(this.watches, function(watch) {
      return watch.token == token;
    });
    callback(undefined);
  },

  getWatches : function(callback) {
    callback(undefined, this.watches);
  }
});

module.exports = MemoryDb;
