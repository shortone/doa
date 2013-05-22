
var _ = require('underscore');

var Resources = {

  create : function(routes) {

    var res = function(app) {
      this.app = app;
      _.bindAll(this);
    };

    _.extend(res.prototype, routes);

    return res;
  }
};

module.exports = Resources;
