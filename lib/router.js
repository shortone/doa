
var _ = require('underscore');

var Home = require('./res/home'),
    Watches = require('./res/watches');

var Router = function(app, config) {

  this.config = config;

  this.home = new Home(app);
  this.watches = new Watches(app);
};

_.extend(Router.prototype, {
  
  setup : function(express) {

    express.get('/', this.home.index);

    express.namespace('/api', _.bind(function() {
      
      express.namespace('/watches', _.bind(function() {
        
        express.get('/', this.watches.index);
        express.post('/', this.watches.create);
        express.delete('/:token', this.watches.destroy);
      }, this));
    }, this));

    express.post('/u/:token', this.watches.notify);

    return express;
  }
});

module.exports = Router;
