
var _ = require('underscore');

module.exports = {

  create : function(methods) {

    var res = function(app) {

      this.app = app;
      _.bindAll(this);

      if (this.initialize) {
        this.initialize();
      }
    };

    _.extend(res.prototype, methods);

    return res;
  }
};
