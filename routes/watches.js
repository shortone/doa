
var _ = require('underscore');

var Watches = function(app) {
  this.app = app;
};

_.extend(Watches.prototype, {

  index : function(req, res) {
    res.json([]);
  }
});

module.exports = Watches;
