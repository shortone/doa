
var _ = require('underscore');

var MemoryDb = function(config) {
  this.config = config;
  this.watches = [
    {
      title : 'Website',
      token : 'abc',
      status : 'up'
    },
    {
      title : 'Mail Server',
      token : 'def',
      status : 'down'
    },
    {
      title : 'Monitoring Tool',
      token : 'ghi',
      status : 'new'
    }
  ];
};

_.extend(MemoryDb.prototype, {

  addWatch : function(watch, callback) {
    watch.status = 'new';
    watch.token = Math.random().toString(36).substring(7);
    this.watches.push(watch);
    callback(undefined, watch);
  },

  getWatches : function(callback) {
    callback(undefined, this.watches);
  }
});

module.exports = MemoryDb;
