var path = require('path');
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
plugins['ng-compiler'] = require(path.resolve('index.js'));

describe("gulp-angular-compiler", function() {

  it('should compile successful', function(done) {
    gulp.src(['./test/input/**/*.html'])
      .pipe(plugins['ng-compiler']({
      	config: {}
      }))
      .pipe(gulp.dest('./.tmp'))
      .on('end', done);
  });

});