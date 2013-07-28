
var _ = require('underscore');

module.exports = require('./utils').create({

  initialize: function() {
    _.bindAll(this, 'index');
  },

  index: function(req, res) {
    var app = this.app;
    this.app.db.getWatches(function(err, watches) {
      res.render('index', { watches: watches, translations: app.translations });
    });
  }
});
