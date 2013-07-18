
App.factory('i18n', [ '$window', '$rootScope', function($window, $rootScope) {

  return {
    
    t: function() {

      var i18n = $window.i18n;

      // FIXME: find out why $rootScope.translations won't work in App.run()
      if (!i18n.resStore) {
        i18n.init({ resStore: $rootScope.translations, lng: 'en' });
      }

      return i18n.t.apply(i18n.t, Array.prototype.slice.call(arguments));
    }
  };
} ]);
