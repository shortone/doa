
var App = angular.module('doa', []);

App.run([ '$window', 'i18n', function($window, i18n) {
  i18n.init({ resStore: $window.doa.i18n, lng: 'en' });
} ]);
