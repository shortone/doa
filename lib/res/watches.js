
var _ = require('underscore'),
    crypto = require('crypto');

module.exports = require('./utils').create({

  intervals : {
    hourly : 3600,
    daily : 86400,
    weekly : 604800,
    monthly : 2538000
  },

  index : function(req, res) {
    this.app.db.getWatches(function(err, watches) {
      res.json(watches);
    });
  },

  ping : function(req, res) {
    
    this.app.db.getWatch(req.params.token, _.bind(function(err, watch) {

      var now = new Date(),
          update = {
            token : watch.token,
            lastPingedAt : now,
            lastCheckedAt : now,
            status : 'up'
          };

      this.app.db.updateWatch(update, function(err) {
        res.send('ok');
      });
    }, this));
  },

  create : function(req, res) {

    this.uniqueToken(_.bind(function(err, token) {

      var watch = _.defaults(
        { status : 'new', token : token },
        _.pick(req.body, 'name'),
        { interval : this.intervals[req.body.interval] },
        { interval : this.intervals.daily }
      );

      this.app.db.addWatch(watch, function(err, watch) {
        res.json(watch);
      });
    }, this));
  },

  update : function(req, res) {

    this.app.db.getWatch(req.params.token, _.bind(function(err, watch) {
      if (err) {
        return res.send(400);
      }

      var data = {
        token : req.params.token,
        name : req.body.name,
        interval : parseInt(req.body.interval, 10)
      };

      this.app.db.updateWatch(data, _.bind(function(err, result) {
        if (err) {
          this.app.log.error('could not update watch: ' + err);
          return res.send(500);
        }
        res.json(result);
      }, this));
    }, this));
  },

  destroy : function(req, res) {
    this.app.db.removeWatch(req.params.token, function(err) {
      res.send(204);
    });
  },

  uniqueToken : function(callback) {
    
    this.randomToken(_.bind(function(err, token) {
      if (err) {
        return callback(err);
      }

      // TODO: add exists method to db
      this.app.db.watchExists(token, _.bind(function(err, exists) {
        if (err) {
          return callback(err);
        } else if (!exists) {
          return callback(undefined, token);
        }

        this.uniqueToken(callback);
      }, this));
    }, this));
  },

  randomToken : function(callback) {
    crypto.randomBytes(3, function(err, buf) {
      return err ? callback(err) : callback(undefined, buf.toString('hex'));
    });
  }
});
