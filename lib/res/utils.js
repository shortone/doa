
var _ = require('underscore');

module.exports = {

  create : function(methods) {

    var res = function(app) {

      this.app = app;

      if (this.initialize) {
        this.initialize();
      }
    };

    _.extend(res.prototype, methods);

    return res;
  }
};
