// Karma configuration
// Generated on Sun Jul 21 2013 19:44:34 GMT+0200 (CEST)


// base path, that will be used to resolve files and exclude
basePath = '';


// list of files / patterns to load in the browser
files = [
  JASMINE,
  JASMINE_ADAPTER,
  'lib/assets/js/vendor/underscore.js',
  'lib/assets/js/vendor/jquery.js',
  'lib/assets/js/vendor/bootstrap.js',
  'lib/assets/js/vendor/moment.js',
  'lib/assets/js/vendor/i18next.js',
  'lib/assets/js/vendor/angular.js',
  'lib/assets/js/vendor/ui-bootstrap.js',
  'lib/assets/js/locales/en.coffee',
  'lib/assets/js/init.js',
  'lib/assets/js/controllers.js',
  'lib/assets/js/filters.js',
  'lib/assets/js/services.js',
  'spec/browser/support/**/*.js',
  'spec/browser/**/*.spec.js'
];


// list of files to exclude
exclude = [
];


// test results reporter to use
// possible values: 'dots', 'progress', 'junit'
reporters = ['progress'];


// web server port
port = 9876;


// cli runner port
runnerPort = 9100;


// enable / disable colors in the output (reporters and logs)
colors = true;


// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;


// enable / disable watching file and executing tests whenever any file changes
autoWatch = true;


// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
browsers = ['Chrome'];


// If browser does not capture in given timeout [ms], kill it
captureTimeout = 60000;


// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = false;
