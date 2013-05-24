
var _ = require('underscore');

module.exports = {

  create : function(routes) {

    var res = function(app) {
      this.app = app;
      _.bindAll(this);
    };

    _.extend(res.prototype, routes);

    return res;
  }
};
