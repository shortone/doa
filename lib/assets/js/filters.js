
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
