
module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jshint : {
      all : [ 'index.js', 'lib/**/*.js', 'spec/**/*.js' ]
    }
  });

  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jasmine-node');

  grunt.registerTask('default', [ 'jshint', 'jasmine_node' ]);
};
