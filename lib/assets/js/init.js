
var App = angular.module('doa', []);

App.run([ '$window', 'i18n', function($window, i18n) {
  i18n.init({ resStore: $window.doa.i18n, lng: 'en' });
} ]);

App.run([ '$rootScope', function($rootScope) {
  $rootScope.watchIntervals = [
    { name: 'hourly', value: 3600 },
    { name: 'daily', value: 86400 },
    { name: 'weekly', value: 592200 },
    { name: 'monthly', value: 2592000 }
  ];
} ]);
