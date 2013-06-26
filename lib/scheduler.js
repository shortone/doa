
exports.inject = function(deps) {
  deps = deps || {};

  var _ = require('underscore'),
      cron = deps.cron || require('cron'),
      Logger = deps.Logger || require('./logger').inject();

  var Scheduler = function(app) {

    _.bindAll(this);

    this.app = app;
    this.log = new Logger('scheduler', app.config);
  };

  _.extend(Scheduler.prototype, {

    start : function(callback) {

      this.job = new cron.CronJob({
        cronTime : '*/10 * * * * *',
        onTick : this.trigger,
        start : true,
        timeZone : 'UTC'
      });

      this.log.info('Watches will be checked every 10 seconds');
      callback();
    },

    stop : function(callback) {
      if (this.job) {
        this.job.stop();
      }
      callback();
    },

    trigger : function() {
      this.app.emit('watch');
    }
  });

  return Scheduler;
};
