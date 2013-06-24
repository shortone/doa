
var _ = require('underscore');

var Logger = require('../logger');

module.exports = require('./utils').create({

  initialize : function() {
    this.log = new Logger('watchdog', this.app.config);
  },

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
