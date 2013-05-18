
var _ = require('underscore');

var Watches = function(app) {
  this.app = app;
};

_.extend(Watches.prototype, {

  index : function(req, res) {
    this.app.db.getWatches(function(err, watches) {
      res.json(watches);
    });
  }
});

module.exports = Watches;
