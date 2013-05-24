
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
    
    this.app.db.get(req.params.token, _.bind(function(err, watch) {
      
      var updates = {
        token : watch.token,
        lastSeenAt : new Date()
      };

      if (watch.status != 'up') {
        updates.lastCheckedAt = updates.lastSeenAt;
        updates.status = 'up';
      }

      this.app.db.update([ updates ], function(err) {
        res.send('ok');
      });
    }, this));
  },

  create : function(req, res) {

    var watch = _.defaults({ status : 'new', token : uuid.v4() }, _.pick(req.body, 'title'), { interval : this.intervals[req.body.interval] }, { interval : this.intervals.daily });

    this.app.db.addWatch(watch, function(err, watch) {
      res.json(watch);
    });
  },

  destroy : function(req, res) {
    this.app.db.removeWatch(req.params.token, function(err) {
      res.send(204);
    });
  }
});
