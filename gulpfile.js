/* eslint-env node */

'use strict';

var gulp = require('gulp');

var dest        = gulp.dest;
var parallel    = gulp.parallel;
var series      = gulp.series;
var src         = gulp.src;
var task        = gulp.task;

task
(
    'clean',
    function ()
    {
        var del = require('del');

        var stream = del(['coverage', 'lib/**/*.min.js', 'Q-exact.md']);
        return stream;
    }
);

task
(
    'lint',
    function ()
    {
        var lint = require('gulp-fasttime-lint');

        var stream =
        lint
        (
            {
                src: ['*.js', 'lib/**/*.js', 'test/**/*.js', '!**/*.min.js'],
                globals: ['global', 'self'],
            }
        );
        return stream;
    }
);

task
(
    'test',
    function ()
    {
        var mocha = require('gulp-spawn-mocha');

        var stream = src('test/**/*.spec.js').pipe(mocha({ istanbul: true }));
        return stream;
    }
);

task
(
    'uglify',
    function ()
    {
        var rename = require('gulp-rename');
        var uglify = require('gulp-uglify');

        var stream =
        src('lib/q.js')
        .pipe(uglify({ compress: { global_defs: { DEBUG: false } } }))
        .pipe(rename({ extname: '.min.js' }))
        .pipe(dest('lib'));
        return stream;
    }
);

task
(
    'jsdoc2md',
    function ()
    {
        var fs          = require('fs');
        var jsdoc2md    = require('jsdoc-to-markdown');
        var util        = require('util');

        var writeFile = util.promisify(fs.writeFile);

        var promise =
        jsdoc2md
        .render({ files: 'lib/q.js' })
        .then
        (
            function (output)
            {
                var promise = writeFile('Q-exact.md', output);
                return promise;
            }
        );
        return promise;
    }
);

task('default', series(parallel('clean', 'lint'), 'test', parallel('uglify', 'jsdoc2md')));
