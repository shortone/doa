
var _ = require('underscore'),
    fs = require('fs'),
    yaml = require('js-yaml');

var YamlDb = function(config) {
  this.file = config.get('db').file;
};

_.extend(YamlDb.prototype, {

  open : function(callback) {
    callback();
  },

  addWatch : function(watch, callback) {

    this.readData(_.bind(function(err, watches) {
      if (err) {
        return callback(err);
      }

      watches.push(watch);

      this.writeData(watches, function(err) {
        return err ? callback(err) : callback(undefined, watch);
      });
    }, this));
  },

  getWatch : function(token, callback) {

    this.readData(function(err, watches) {

      callback(undefined, _.find(watches, function(watch) {
        return watch.token == token;
      }));
    });
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

    this.readData(_.bind(function(err, watches) {
      if (err) {
        return callback(err);
      }

      _.extend(_.find(watches, function(watch) {
        return watch.token == updatedWatch.token;
      }), updatedWatch);

      this.writeData(watches, callback);
    }, this));
  },

  updateOutdatedWatches : function(date, callback) {

    this.readData(_.bind(function(err, watches) {
      if (err) {
        return callback(err);
      }
      
      var result = {
        downed: 0,
        checked: 0
      };

      _.each(watches, function(watch) {

        if (watch.status == 'new' || !watch.lastCheckedAt || date.getTime() - watch.lastCheckedAt.getTime() - watch.interval * 1000 < 0) {
          return;
        }

        watch.lastCheckedAt = date;

        if (watch.status == 'up' && watch.lastSeenAt.getTime() + watch.interval * 1000 < date.getTime()) {
          watch.status = 'down'
          result.downed++;
        } else {
          result.checked++;
        }
      });

      this.writeData(watches, function(err) {
        if (err) {
          return callback(err);
        }
        callback(undefined, result);
      });
    }, this));
  },

  removeWatch : function(token, callback) {

    this.readData(_.bind(function(err, watches) {
      if (err) {
        return callback(err);
      }

      watches = _.reject(watches, function(watch) {
        return watch.token == token;
      });

      this.writeData(watches, callback);
    }, this));
  },

  getWatches : function(callback) {
    this.readData(callback);
  },

  close : function(callback) {
    callback();
  },

  writeData : function(data, callback) {

    var rawData;
    try {
      rawData = yaml.safeDump(_.map(data, function(watch) {

        _.each([ 'lastSeenAt', 'lastCheckedAt' ], function(attr) {
          if (watch[attr]) {
            watch[attr] = watch[attr].getTime();
          }
        });

        return watch;
      }));
    } catch(err) {
      return callback(err);
    }
    
    fs.writeFile(this.file, rawData, callback);
  },

  readData : function(callback) {

    fs.readFile(this.file, { encoding : 'utf-8' }, function(err, rawData) {
      if (err) {
        if (err.code == 'ENOENT') {
          return callback(undefined, []);
        }
        return callback(err);
      }

      try {
        return callback(undefined, _.map(yaml.safeLoad(rawData), function(watch) {

          _.each([ 'lastSeenAt', 'lastCheckedAt' ], function(attr) {
            if (watch[attr]) {
              watch[attr] = new Date(watch[attr]);
            }
          });

          return watch;
        }));
      } catch(err2) {
        return callback(err2);
      }
    });
  }
});

module.exports = YamlDb;
