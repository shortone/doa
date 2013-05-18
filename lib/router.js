
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
  
  setup : function(app) {

    var routes = this.routes;

    app.resource(routes.home);

    app.namespace('/api', function() {
      app.resource('watches', routes.watches);
    });

    return app;
  }
});

module.exports = Router;
