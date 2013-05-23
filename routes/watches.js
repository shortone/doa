
var _ = require('underscore'),
    uuid = require('node-uuid');

module.exports = require('./res').create({

  index : function(req, res) {
    this.app.db.getWatches(function(err, watches) {
      res.json(watches);
    });
  },

  create : function(req, res) {

    var watch = _.defaults({ status : 'new', token : uuid.v4() }, _.pick(req.body, 'title', 'interval'), { interval : 'daily' });

    this.app.db.addWatch(watch, function(err, watch) {
      res.json(watch);
    });
  },

  destroy : function(req, res) {
    this.app.db.removeWatch(req.params.watch, function(err) {
      res.send(204);
    });
  }
});
