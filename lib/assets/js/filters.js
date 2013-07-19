
App.filter('t', [ 'i18n', function(i18n) {

  return function() {
    return i18n.t.apply(i18n.t, Array.prototype.slice.call(arguments));
  };
} ]);

App.filter('watchClass', function() {

  var knownUiStatuses = [ 'editing' ];

  return function(watch, ui) {

    if (_.contains(knownUiStatuses, ui.status)) {
      return 'status-' + ui.status;
    } else {
      return 'status-' + watch.status;
    }
  };
});
