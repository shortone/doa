
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
      
      var values = {
        lastSeenAt : new Date()
      };

      if (watch.status != 'up') {
        values.lastCheckedAt = values.lastSeenAt;
        values.status = 'up';
      }

      this.app.db.updateWatches([ [ [ watch.token ], values ] ], function(err) {
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
        name : req.body.name,
        interval : parseInt(req.body.interval, 10)
      };

      this.app.db.updateWatches([ [ [ watch.token ], data ] ], function(err) {
        if (err) {
          return res.send(500);
        }
        res.json(_.extend(watch, data));
      });
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
      this.app.db.getWatch(token, _.bind(function(err, watch) {
        if (err) {
          return callback(err);
        } else if (!watch) {
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
