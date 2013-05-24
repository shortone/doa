
var _ = require('underscore'),
    cron = require('cron');

var Logger = require('./logger');

var Watchdog = function(db, config) {

  this.db = db;
  this.config = config;
  this.log = new Logger('watchdog', this.config);

  this.configure();
  this.config.on('change', _.bind(this.configure, this));
};

_.extend(Watchdog.prototype, {

  configure : function() {
    // restart with new interval on config change
  },

  start : function() {
    this.stop();
    this.job = new cron.CronJob({
      cronTime : '*/10 * * * * *',
      onTick : _.bind(this.check, this),
      start : true,
      timeZone : 'UTC'
    });
    this.log.debug('Started');
  },

  stop : function() {
    if (this.job) {
      this.job.stop();
    }
  },

  check : function() {

    var now = new Date();

    this.db.outdated(now, _.bind(function(err, watches) {

      var updates = [];

      // up -> down
      updates = updates.concat(_.map(_.select(watches, function(watch) {
        return watch.status == 'up' && watch.lastSeenAt.getTime() + watch.interval * 1000 < now.getTime();
      }), function(watch) {
        return {
          token : watch.token,
          status : 'down',
          lastCheckedAt : now
        };
      }));

      this.db.update(updates, function(err) {
        if (err) {
          throw new Error('Could not update');
        }
        console.log('done');
      });
    }, this));
  }
});

module.exports = Watchdog;
