
App.animation('slide-open', function() {
  return {

    setup: function(element) {
      $(element).hide();
    },

    start: function(element, done, memo) {
      $(element).slideDown('normal', function() {
        done();
      });
    },

    cancel: function() {}
  }
});

App.animation('slide-close', function() {
  return {

    setup: function(element) {
      return $(element).is(':visible');
    },

    start: function(element, done, visible) {
      if (!visible) {
        return done();
      }
      $(element).slideUp('normal', function() {
        done();
      });
    },

    cancel: function() {}
  }
});
