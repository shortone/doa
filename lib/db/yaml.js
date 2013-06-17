
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

  close : function(callback) {
    callback();
  },

  getOutdatedWatches : function(date, callback) {

    this.readData(function(err, watches) {
      if (err) {
        return callback(err);
      }
      
      callback(undefined, _.select(watches, function(watch) {
        return watch.status != 'new' && watch.lastCheckedAt && date.getTime() - watch.lastCheckedAt.getTime() - watch.interval * 1000 >= 0;
      }));
    });
  },

  updateWatches : function(updates, callback) {

    this.readData(_.bind(function(err, watches) {
      if (err) {
        return callback(err);
      }

      _.each(updates, _.bind(function(update) {

        var tokens = update[0],
            values = update[1];

        _.each(tokens, _.bind(function(token) {
          _.extend(_.find(watches, function(watch) {
            return watch.token == token;
          }), values);
        }, this));
      }, this));

      this.writeData(watches, callback);
    }, this));
  },

  getWatch : function(token, callback) {

    this.readData(function(err, watches) {

      callback(undefined, _.find(watches, function(watch) {
        return watch.token == token;
      }));
    });
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

  writeData : function(data, callback) {

    var rawData;
    try {
      rawData = yaml.safeDump(data);
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
        return callback(undefined, yaml.safeLoad(rawData));
      } catch(err2) {
        return callback(err2);
      }
    });
  }
});

module.exports = YamlDb;
