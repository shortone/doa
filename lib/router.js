
var _ = require('underscore');

var Home = require('../routes/home'),
    Watches = require('../routes/watches');

var Router = function(app, config) {

  this.config = config;

  this.routes = {
    home : new Home(app),
    watches : new Watches(app)
  };
};

_.extend(Router.prototype, {
  
  setup : function(express) {

    express.resource(this.routes.home);

    express.namespace('/api', _.bind(function() {
      express.resource('watches', this.routes.watches);
    }, this));

    return express;
  }
});

module.exports = Router;
