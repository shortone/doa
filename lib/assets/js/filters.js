
App.filter('t', [ 'i18n', function(i18n) {

  return function() {
    return i18n.t.apply(i18n.t, Array.prototype.slice.call(arguments));
  };
} ]);

App.filter('watchClass', function() {

  var knownUiStatuses = [ 'editing' ];

  return function(watch, uiStatus) {

    if (_.contains(knownUiStatuses, uiStatus)) {
      return 'status-' + uiStatus;
    } else {
      return 'status-' + watch.status;
    }
  };
});
