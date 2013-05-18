
var _ = require('underscore');

var MemoryDb = function(config) {
  this.config = config;
};

_.extend(MemoryDb.prototype, {

  getWatches : function(callback) {
    callback(undefined, [
      {
        title : 'Website',
        status : 'up'
      },
      {
        title : 'Backup Script',
        status : 'going-down'
      },
      {
        title : 'Database',
        status : 'going-up'
      },
      {
        title : 'Mail Server',
        status : 'down'
      },
      {
        title : 'Monitoring Tool',
        status : 'new'
      }
    ]);
  }
});

module.exports = MemoryDb;
