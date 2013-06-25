
var _ = require('underscore');

var Home = require('./res/home'),
    Watches = require('./res/watches');

var Router = function(app) {

  this.app = app;

  this.home = new Home(app);
  this.watches = new Watches(app);
};

_.extend(Router.prototype, {
  
  setup : function(express) {

    express.get('/', this.home.index);

    express.namespace('/api', _.bind(function() {
      
      express.namespace('/watches', _.bind(function() {
        
        express.get('/', this.watches.index);
        express.post('/', this.requireJson, this.watches.create);
        express.put(':token', this.requireJson, this.watches.update);
        express.patch(':token', this.requireJson, this.watches.update);
        express.del(':token', this.watches.destroy);
      }, this));
    }, this));

    express.post('/:token([a-z0-9]{4,})', this.watches.ping);

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
