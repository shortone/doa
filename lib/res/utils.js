
var _ = require('underscore');

module.exports = {

  create : function(routes) {

    var res = function(app) {

      this.app = app;
      _.bindAll(this);

      if (this.initialize) {
        this.initialize();
      }
    };

    _.extend(res.prototype, routes);

    return res;
  }
};
