
var _ = require('underscore');

var Home = function(app) {
  this.app = app;
};

_.extend(Home.prototype, {

  index : function(req, res) {
    this.app.db.getWatches(function(err, watches) {
      res.render('index', { watches : watches });
    });
  }
});

module.exports = Home;
