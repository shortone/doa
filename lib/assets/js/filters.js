
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

App.filter('watchButtonClass', function() {

  return function(watch, ui, main) {

    if (ui.status == 'editing') {
      return main ? 'btn-primary' : null;
    }

    switch(watch.status) {
      case 'up': return 'btn-success';
      case 'down': return 'btn-danger';
      default: return null;
    }
  };
});
