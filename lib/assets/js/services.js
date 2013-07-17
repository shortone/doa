
App.factory('i18n', [ '$rootScope', function($rootScope) {

  return {
    
    t: function(key, options) {
      var translation = $rootScope.translations[key];
      _.each(options, function(v, k) {
        translation = translation.replace('%{' + k + '}', v);
      });
      return translation;
    }
  };
} ]);
