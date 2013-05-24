
var _ = require('underscore');

var Logger = require('../logger');

module.exports = require('./utils').create({

  initialize : function() {
    this.log = new Logger('watchdog', this.app.config);
  },

  watch : function() {

    var now = new Date();
    this.log.debug('watching at ' + now);

    this.app.db.outdated(now, _.bind(function(err, watches) {
      if (err) {
        return this.log.error('could not get outdated watches: ' + err);
      }
      this.updateOutdated(now, watches);
    }, this));
  },

  updateOutdated : function(now, watches) {

    var updates = this.downUpdates(now, watches);
    if (!updates.length) {
      return this.log.debug('all watches up, new or already down; nothing to do');
    }

    this.app.db.update(updates, _.bind(function(err) {
      if (err) {
        return this.log.error('could not down watches: ' + err);
      }
      this.log.info('downed ' + updates.length + ' watches');
    }, this));
  },

  downUpdates : function(now, watches) {

    var updates = [];

    _.each(watches, function(watch) {

      if (watch.status == 'up' && watch.lastSeenAt.getTime() + watch.interval * 1000 < now.getTime()) {
        updates.push({
          token : watch.token,
          status : 'down',
          lastCheckedAt : now
        });
      }
    });

    return updates;
  }
});
