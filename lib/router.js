
var _ = require('underscore');

var Home = require('./res/home'),
    Watches = require('./res/watches'),
    Watchdog = require('./res/watchdog');

var Router = function(app) {

  this.app = app;

  this.home = new Home(app);
  this.watches = new Watches(app);
  this.watchdog = new Watchdog(app);
};

_.extend(Router.prototype, {
  
  setup : function(express) {

    this.app.on('watch', this.watchdog.watch);

    express.get('/', this.home.index);

    express.namespace('/api', _.bind(function() {
      
      express.namespace('/watches', _.bind(function() {
        
        express.get('/', this.watches.index);
        express.post('/', this.watches.create);
        express.delete('/:token', this.watches.destroy);
      }, this));
    }, this));

    express.post('/:token([a-z0-9\-]{36})', this.watches.notify);

    return express;
  }
});

module.exports = Router;
