var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var uuid = require('uuid');
var plugins = require('gulp-load-plugins')();
plugins['ng-compiler'] = require(path.resolve('index.js'));

describe('gulp-angular-compiler', function() {

  it('should compile successful with configDir', function(done) {
    gulp.src(['./test/sample/www/**/*.html'])
      .pipe(plugins['ng-compiler']({
        configDir: path.resolve('./test/sample/angularify.json'),
        injectors: {
          onBuildCss: function(data, info) {
            return '<!-- build:css styles/' + (info.name ? info.name : uuid.v4()) + '.css -->' + data + '<!-- endbuild -->';
          },
          onBuildJs: function(data, info) {
            return '<!-- build:js scripts/' + (info.name ? info.name : uuid.v4()) + '.js -->' + data + '<!-- endbuild -->';
          }
        }
      }))
      .pipe(gulp.dest('./test/sample/.tmp'))
      .on('end', function() {
        var result = fs.readFileSync(path.resolve('test', 'sample', '.tmp', 'index.html'), {
          encoding: 'utf8'
        });
        var output = fs.readFileSync(path.resolve('test', 'sample', 'www', 'index.compiled.html'), {
          encoding: 'utf8'
        });
        expect(result).toEqual(output);
        done.apply(null, arguments);
      });
  });

  it('should compile successful with config json', function(done) {
    gulp.src(['./test/sample/www/**/*.html'])
      .pipe(plugins['ng-compiler']({
        config: require(path.resolve('./test/sample/angularify.json')),
        injectors: {
          onBuildCss: function(data, info) {
            return '<!-- build:css styles/' + (info.name ? info.name : uuid.v4()) + '.css -->' + data + '<!-- endbuild -->';
          },
          onBuildJs: function(data, info) {
            return '<!-- build:js scripts/' + (info.name ? info.name : uuid.v4()) + '.js -->' + data + '<!-- endbuild -->';
          }
        }
      }))
      .pipe(gulp.dest('./test/sample/.tmp'))
      .on('end', function() {
        var result = fs.readFileSync(path.resolve('test', 'sample', '.tmp', 'index.html'), {
          encoding: 'utf8'
        });
        var output = fs.readFileSync(path.resolve('test', 'sample', 'www', 'index.compiled.html'), {
          encoding: 'utf8'
        });
        expect(result).toEqual(output);
        done.apply(null, arguments);
      });
  });

});