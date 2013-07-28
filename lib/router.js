
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
        
        express.get('/', this.mustAcceptJson, watches.index);
        express.post('/', this.mustAcceptJson, this.contentTypeMustBeJson, watches.create);
        express.put(':token', this.mustAcceptJson, this.contentTypeMustBeJson, watches.update);
        express.patch(':token', this.mustAcceptJson, this.contentTypeMustBeJson, watches.update);
        express.del(':token', this.mustAcceptJson, watches.destroy);
      }, this));
    }, this));

    express.post('/:token([a-z0-9]{4,})', watches.ping);

    return express;
  },

  mustAcceptJson : function(req, res, next) {
    if (!_.find(req.accept.types, function(type) {
      return (type.type == 'application' && type.subtype == 'json') || (type.type == '*' && type.subtype == '*');
    })) {
      return res.send(406, "The only supported content type is application/json");
    }
    next();
  },

  contentTypeMustBeJson : function(req, res, next) {
    if (!req.headers['content-type'] || !req.headers['content-type'].match(/^application\/json(; )?/)) {
      return res.send(415, "Content-Type must be application/json");
    }
    next();
  }
});

module.exports = Router;
