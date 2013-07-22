
module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      all: [ 'index.js', 'lib/**/*.js', '!lib/assets/js/vendor/**', 'spec/**/*.js', '!spec/browser/support/angular*.js' ]
    },

    jasmine_node: {
      projectRoot: 'spec/server',
      requirejs: false,
      forceExit: true
    }
  });

  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jasmine-node');

  grunt.registerTask('default', [ 'jshint', 'jasmine_node' ]);
};
