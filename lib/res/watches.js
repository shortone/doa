
var _ = require('underscore'),
    uuid = require('node-uuid');

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

  notify : function(req, res) {
    
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

    var watch = _.defaults({ status : 'new', token : uuid.v4() }, _.pick(req.body, 'name'), { interval : this.intervals[req.body.interval] }, { interval : this.intervals.daily });

    this.app.db.addWatch(watch, function(err, watch) {
      res.json(watch);
    });
  },

  update : function(req, res) {

    this.app.db.getWatch(req.params.token, _.bind(function(err, watch) {
      if (err) {
        return res.send(400);
      }

      this.app.db.updateWatches([ [ [ watch.token ], _.pick(req.body, 'name', 'interval') ] ], function(err) {
        if (err) {
          return res.send(500);
        }
        res.json(watch);
      });
    }, this));
  },

  destroy : function(req, res) {
    this.app.db.removeWatch(req.params.token, function(err) {
      res.send(204);
    });
  }
});
