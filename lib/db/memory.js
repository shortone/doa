
var _ = require('underscore');

var MemoryDb = function(config) {
  this.watches = [
    {
      name : 'Website',
      token : 'abcdef',
      status : 'up',
      interval : 20,
      lastCheckedAt : new Date(1369055439000),
      lastSeenAt : new Date(1369055439000)
    },
    {
      name : 'Mail Server',
      token : 'bcdefg',
      status : 'down',
      interval : 86400,
      lastCheckedAt : new Date(1369055439000),
      lastSeenAt : new Date(1369055439000)
    },
    {
      name : 'Monitoring Tool',
      token : 'cdefgh',
      status : 'new',
      interval : 86400
    }
  ];
};

_.extend(MemoryDb.prototype, {

  getOutdatedWatches : function(date, callback) {
    callback(undefined, _.select(this.watches, function(watch) {
      return watch.status != 'new' && watch.lastCheckedAt && date.getTime() - watch.lastCheckedAt.getTime() - watch.interval * 1000 >= 0;
    }));
  },

  updateWatches : function(updates, callback) {
    _.each(updates, _.bind(function(update) {

      var tokens = update[0],
          values = update[1];

      _.each(tokens, _.bind(function(token) {
        _.extend(_.find(this.watches, function(watch) {
          return watch.token == token;
        }), values);
      }, this));
    }, this));
    callback();
  },

  getWatch : function(token, callback) {
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
