
var _ = require('underscore');

var Router = function(app, resources) {
  this.app = app;
  this.resources = resources;
};

_.extend(Router.prototype, {
  
  setup : function(express) {

    var home = this.resources.home,
        watches = this.resources.watches;

    express.get('/', home.index);

    express.namespace('/api', _.bind(function() {
      
      express.namespace('/watches', _.bind(function() {
        
        express.get('/', watches.index);
        express.post('/', this.requireJson, watches.create);
        express.put(':token', this.requireJson, watches.update);
        express.patch(':token', this.requireJson, watches.update);
        express.del(':token', watches.destroy);
      }, this));
    }, this));

    express.post('/:token([a-z0-9]{4,})', watches.ping);

    return express;
  },

  requireJson : function(req, res, next) {
    if (!req.headers['content-type'] || req.headers['content-type'] != 'application/json') {
      return res.send(415, "Content-Type must be application/json");
    }
    next();
  }
});

module.exports = Router;
