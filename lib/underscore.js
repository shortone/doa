
var _ = require('underscore');

_.mixin({

  bindErr : function(func, context) {
    var args = Array.prototype.slice.call(arguments, 2);
    return function(err) {
      return func.apply(context, [ err ].concat(args, Array.prototype.slice.call(arguments, 1)));
    };
  }
});

module.exports = _;
