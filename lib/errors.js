
var util = require('util');

var createError = function(name) {

  CustomError = function(msg) {
    Error.call(this);
    Error.captureStackTrace(this, arguments.callee);
    this.message = msg;
  };

  util.inherits(CustomError, Error);

  CustomError.prototype.name = name;

  return CustomError;
};

// TODO: remove if unused
module.exports = {
};
