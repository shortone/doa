
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

    var routes = this.routes;

    this.get(express, '/', 'home', 'index');
    this.get(express, '/api/watches', 'watches', 'index');
    express.post('/api/watches', _.bind(this.routes.watches.create, this.routes.watches));

    return express;
  },

  get : function(express, path, resource, name) {
    express.get(path, _.bind(this.routes[resource][name], this.routes[resource]));
  }
});

module.exports = Router;
