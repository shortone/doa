
describe("i18n service", function() {

  var i18n, windowMock;

  beforeEach(function() {

    windowMock = { i18n: {} };

    module(function($provide) {
      $provide.value('$window', windowMock);
    });

    inject(function($injector) {
      i18n = $injector.get('i18n');
    });
  });

  it("should use i18next", function() {
    expect(i18n).toBe(windowMock.i18n);
  });
});
