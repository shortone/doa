
var _ = require('underscore');

var Logger = require('../logger');

module.exports = require('./utils').create({

  initialize : function() {
    this.log = new Logger('watchdog', this.app.config);
  },

  watch : function() {

    var now = new Date();
    this.log.debug('watching at ' + now);

    this.app.db.getOutdatedWatches(now, _.bind(function(err, watches) {
      if (err) {
        return this.log.error('could not get outdated watches: ' + err);
      }

      var down = [];
      var checked = [];

      _.each(watches, function(watch) {
        if (watch.status == 'up' && watch.lastSeenAt.getTime() + watch.interval * 1000 < now.getTime()) {
          down.push(watch.token);
        } else {
          checked.push(watch.token);
        }
      });

      var updates = [];
      if (down.length) {
        updates.push([ down, { status : 'down', lastCheckedAt : now } ]);
      }
      if (checked.length) {
        updates.push([ checked, { lastCheckedAt : now } ]);
      }

      if (!updates.length) {
        return this.log.debug('all watches up, new or already down; nothing to do');
      }

      this.app.db.updateWatches(updates, _.bind(function(err) {
        if (err) {
          return this.log.error('Could not updates watches');
        }
        this.log.info('checked ' + (checked.length + down.length) + ' watches; ' + down.length + ' are down');
      }, this));
    }, this));
  }
});
