/* jshint node: true */

'use strict';

module.exports =
    function (grunt)
    {
        // Project configuration.
        grunt.initConfig(
            {
                clean: ['coverage', 'lib/**/*.min.js'],
                jsdoc2md:
                {
                    main: { dest: 'Q-exact.md', src: 'lib/q.js' },
                    options: { }
                },
                jshint:
                {
                    main: ['*.js', 'lib/**/*.js', 'test/**/*.js'],
                    options:
                    {
                        curly: true,
                        eqeqeq: true,
                        immed: true,
                        latedef: true,
                        maxlen: 100,
                        newcap: false,
                        noarg: true,
                        quotmark: true,
                        strict: true,
                        trailing: true,
                        undef: true,
                        unused: true,
                    
                        boss: true,
                        elision: true,
                        eqnull: true,
                        evil: true,
                        validthis: true,
                        '-W018': true,
                    },
                },
                mocha_istanbul: ['test/**/*.spec.js'],
                uglify:
                {
                    main: { files: { 'lib/q.min.js': 'lib/q.js' } },
                    options: { compress: { global_defs: { DEBUG: false }, hoist_vars: true } }
                }
            }
        );
    
        // These plugins provide necessary tasks.
        grunt.loadNpmTasks('grunt-contrib-clean');
        grunt.loadNpmTasks('grunt-contrib-jshint');
        grunt.loadNpmTasks('grunt-contrib-uglify');
        grunt.loadNpmTasks('grunt-jsdoc-to-markdown');
        grunt.loadNpmTasks('grunt-mocha-istanbul');
    
        // Default task.
        grunt.registerTask('default', ['clean', 'jshint', 'mocha_istanbul', 'jsdoc2md', 'uglify']);
    };
