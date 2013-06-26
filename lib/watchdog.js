
var _ = require('underscore');

var Logger = require('./logger').inject();

var Watchdog = function(app) {
  this.app = app;
  this.log = new Logger('watchdog', this.app.config);
};

_.extend(Watchdog.prototype, {

  watch : function() {

    var now = new Date();
    this.log.debug('watching at ' + now);
    
    this.app.db.updateOutdatedWatches(now, _.bind(function(err, result) {
      if (err) {
        return this.log.error('could not update outdated watches: ' + err);
      }

      if (!result.downed && !result.checked) {
        return this.log.debug('all watches up, new or already down; nothing to do');
      }

      this.log.info('checked ' + (result.downed + result.checked) + ' watches; ' + result.downed + ' are down');
    }, this));
  }
});

module.exports = Watchdog;
