
var _ = require('underscore'),
    http = require('http'),
    path = require('path');

var Express = require('./express'),
    Home = require('../routes/home');

var Application = function(config) {
  this.config = config || {};
  this.routes = {
    home : new Home(this)
  };
};

_.extend(Application.prototype, {

  version : require(path.join('..', 'package')).version,

  start : function() {

    if (this.server) {
      throw new Error('Server has already started');
    }
    
    this.setupExpress();
    this.server = http.createServer(this.express.app);
    this.server.listen(this.express.app.get('port'), _.bind(this.started, this));
  },

  started : function() {
    console.log('DOA listening on port ' + this.express.app.get('port'));
  },

  stop : function() {
    this.server.close();
  },

  setupExpress : function() {
    this.express = new Express(this.config);
    this.express.app.resource(this.routes.home);
  }
});

module.exports = Application;
