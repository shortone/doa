
describe("Version", function() {

  var Application = require('../lib/app'),
      pkg = require('../package');

  it("should be correct", function() {
    expect(Application.prototype.version).toBe(pkg.version);
  });
});
