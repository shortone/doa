
var _ = require('underscore');

var MemoryDb = function(config) {
  this.watches = [];
};

_.extend(MemoryDb.prototype, {

  open : function(callback) {
    callback();
  },

  addWatch : function(watch, callback) {
    this.watches.push(watch);
    callback(undefined, watch);
  },

  getWatch : function(token, callback) {
    callback(undefined, _.find(this.watches, function(watch) {
      return watch.token == token;
    }) || null);
  },

  watchExists : function(token, callback) {
    this.getWatch(token, function(err, watch) {
      if (err) {
        return callback(err);
      }
      callback(undefined, !!watch);
    });
  },

  updateWatch : function(updatedWatch, callback) {
    callback(undefined, _.extend(_.find(this.watches, function(watch) {
      return watch.token == updatedWatch.token;
    }), updatedWatch));
  },

  updateOutdatedWatches : function(date, callback) {

    var result = {
      downed: 0,
      checked: 0
    };

    _.each(this.watches, function(watch) {

      if (watch.status == 'new' || !watch.lastCheckedAt || date.getTime() - watch.lastCheckedAt.getTime() - watch.interval * 1000 < 0) {
        return;
      }

      watch.lastCheckedAt = date;

      if (watch.status == 'up' && watch.lastSeenAt.getTime() + watch.interval * 1000 < date.getTime()) {
        watch.status = 'down';
        result.downed++;
      } else {
        result.checked++;
      }
    });

    callback(undefined, result);
  },

  removeWatch : function(token, callback) {
    this.watches = _.reject(this.watches, function(watch) {
      return watch.token == token;
    });
    callback(undefined);
  },

  getWatches : function(callback) {
    callback(undefined, this.watches);
  },

  close : function(callback) {
    callback();
  }
});

module.exports = MemoryDb;
