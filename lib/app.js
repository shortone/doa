
var _ = require('underscore'),
    http = require('http'),
    path = require('path'),
    routes = require('../routes');

var Express = require('./express');

var Application = function(config) {
  this.config = config || {};
};

_.extend(Application.prototype, {

  start : function() {

    if (this.server) {
      throw new Error('Server has already started');
    }
    
    this.express = new Express(this.config);
    this.express.app.get('/', routes.index);

    this.server = http.createServer(this.express.app);
    this.server.listen(this.express.app.get('port'), _.bind(this.started, this));
  },

  started : function() {
    console.log('DOA listening on port ' + this.express.app.get('port'));
  },

  stop : function() {
    this.server.close();
  }
});

module.exports = Application;
