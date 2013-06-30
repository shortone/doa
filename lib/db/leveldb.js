var _ = require('underscore');
var levelup = require('level');

var LevelDb = function(config) {
  _.bindAll(this);
  this.db = "";
};

_.extend(LevelDb.prototype, {

  open: function(callback) {
    this.db = levelup('./level', {encoding: 'json'});
    callback();
  },

  addWatch: function(watch, callback) {
    this.db.put(watch.token, watch, function(err) {
      callback(err, watch);
    });
  },

  getWatch: function(token, callback) {
    this.db.get(token, callback);
  },

  watchExists: function(token, callback) {
    this.getWatch(token, function(err, watch) {
      callback(undefined, !!watch);
    });
  },

  updateWatch: function(updatedWatch, callback) {
    this.getWatch(updatedWatch.token, _.bind(function(err, watch) {

      if (err) {
        callback(err, undefined);
      }

      this.addWatch(_.extend(watch, updatedWatch), callback);
    }, this));
  },

  updateOutdatedWatches: function(date, callback) {

    var result = {
      downed: 0,
      checked: 0
    };

    this.db.createReadStream()
      .on('data', function(watch) {

        if (watch.status == 'new' || !watch.lastCheckedAt || date.getTime() - watch.lastCheckedAt.getTime() - watch.interval * 1000 < 0) {
          return;
        }

        watch.lastCheckedAt = date;

        if (watch.status == 'up' && watch.lastPingedAt.getTime() + watch.interval * 1000 < date.getTime()) {
          watch.status = 'down';
          result.downed++;
        } else {
          result.checked++;
        }
      })
      .on('end', function() {
        callback(undefined, result);
      });
  },

  removeWatch: function(token, callback) {
    this.db.del(token, callback);
  },

  getWatches: function(callback) {
    var watches = [];
    this.db.createReadStream()
      .on('data', function(watch) {
        watches.push(watch.value);
      })
      .on('error', function(err) {
        callback(err, undefined);
      })
      .on('end', function() {
        callback(undefined, watches);
      });
  },

  close: function(callback) {
    this.db.close(callback);
  }
});

module.exports = LevelDb;