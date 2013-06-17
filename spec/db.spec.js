
var _ = require('underscore'),
    sandbox = require('sandboxed-module');

var matchers = require('./support/matchers'),
    Config = require('./support/mocks/config'),
    Db = sandbox.require('../lib/db/memory', {
      requires : {}
    });

describe("Memory Database", function() {

  var db;

  beforeEach(function() {
    db = new Db(new Config());
  });

  it("should open", function() {
    
    var open = null;

    runs(function() {
      db.open(function(err) {
        open = !err;
      });
    });

    waitsFor(function() {
      return open !== null;
    }, "The database should be open or fail", 250);

    runs(function() {
      expect(open).toBe(true);
    });
  });
});
