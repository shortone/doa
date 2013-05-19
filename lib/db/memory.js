
var _ = require('underscore');

var MemoryDb = function(config) {
  this.config = config;
  this.watches = [
    {
      title : 'Website',
      status : 'up'
    },
    {
      title : 'Mail Server',
      status : 'down'
    },
    {
      title : 'Monitoring Tool',
      status : 'new'
    }
  ];
};

_.extend(MemoryDb.prototype, {

  addWatch : function(watch, callback) {
    this.watches.push(watch);
    callback(undefined);
  },

  getWatches : function(callback) {
    callback(undefined, this.watches);
  }
});

module.exports = MemoryDb;
