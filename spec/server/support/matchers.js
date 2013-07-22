
var _ = require('underscore');

beforeEach(function() {

  this.addMatchers({

    toHaveOptions : function(options) {
      
      var mismatch = null,
          actual = this.actual;

      _.find(options, function(value, key) {

        if (!_.isEqual(actual.get(key), value)) {
          mismatch = { key : key, expected : value, actual : actual.get(key) };
          return true;
        }

        return false;
      });

      if (mismatch) {
        this.message = function() {
          return 'Expected options to have value ' + JSON.stringify(mismatch.expected) +
            ' for key "' + mismatch.key + '", got ' + JSON.stringify(mismatch.actual);
        };
      }

      return !mismatch;
    },

    toHaveLogged : function(expectedLevel, expectedMessage) {

      var found = false,
          wrongLevel = null;

      _.find(this.actual.messages, function(msg) {

        if (_.isRegExp(expectedMessage) ? _.find(msg.args, function(arg) {
          return arg.match(expectedMessage);
        }): _.find(msg.args, function(arg) {
          return arg.indexOf(expectedMessage) >= 0;
        })) {
          wrongLevel = msg.level;

          if (msg.level == expectedLevel) {
            found = true;
            return true;
          }
        }

        return false;
      });

      this.message = function() {
        var msg = 'Expected logger to have logged "' + expectedMessage + '" with log level ' + expectedLevel;
        if (wrongLevel) {
          msg += ', got ' + wrongLevel;
        }
        return msg;
      };

      return found;
    }
  });
});
