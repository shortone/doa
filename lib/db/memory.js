
var _ = require('underscore');

var MemoryDb = function(config) {
  this.watches = [
    {
      title : 'Website',
      token : 'abc',
      status : 'up',
      interval : 20,
      lastCheckedAt : new Date(1369055439000),
      lastSeenAt : new Date(1369055439000)
    },
    {
      title : 'Mail Server',
      token : 'def',
      status : 'down',
      interval : 86400,
      lastCheckedAt : new Date(1369055439000),
      lastSeenAt : new Date(1369055439000)
    },
    {
      title : 'Monitoring Tool',
      token : 'ghi',
      status : 'new',
      interval : 86400
    }
  ];
};

_.extend(MemoryDb.prototype, {

  outdated : function(date, callback) {
    callback(undefined, _.select(this.watches, function(watch) {
      return watch.lastCheckedAt && date.getTime() - watch.lastCheckedAt.getTime() - watch.interval * 1000 >= 0;
    }));
  },

  update : function(updates, callback) {
    _.each(updates, _.bind(function(update) {
      _.extend(_.find(this.watches, function(watch) {
        return watch.token == update.token;
      }), update);
    }, this));
    callback();
  },

  get : function(token, callback) {
    callback(undefined, _.find(this.watches, function(watch) {
      return watch.token == token;
    }));
  },

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
