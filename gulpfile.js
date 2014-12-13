var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var reporters = require('jasmine-reporters');

gulp.task('test', function(cb) {
  gulp.src(['index.js', 'src/**/*.js'])
    .pipe(plugins.istanbul())
    .pipe(plugins.istanbul.hookRequire())
    .on('finish', function() {
      gulp.src(['test/spec/**/*.js'])
        .pipe(plugins.jasmine({
          reporter: new reporters.JUnitXmlReporter({
            savePath: 'test/results/'
          })
        }))
        .pipe(plugins.istanbul.writeReports({
        	dir: './test/results/coverage/'
        }))
        .on('end', cb);
    });
});