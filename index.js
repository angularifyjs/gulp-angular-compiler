// through2 is a thin wrapper around node transform streams
var _ = require('lodash');
var path = require('path');
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var compiler = require(path.resolve(__dirname, 'src', 'compiler.js'));

// Consts
const PLUGIN_NAME = 'gulp-angular-compiler';

// Plugin level function(dealing with files)
function gulpCompiler(opts) {
  opts = _.extend(compiler.defOpts, opts);

  if (!opts.config && !!opts.configDir) {
    try {
      opts.config = require(path.resolve(opts.configDir));
    } catch (ex) {}
  }

  if (!opts || !opts.config) {
    throw new PluginError(PLUGIN_NAME, 'Missing opts.config!');
  }

  // Creating a stream through which each file will pass
  return through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      return cb();
    }

    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streaming not supported'));
      return cb();
    }

    if (file.isBuffer()) {
      var data = compiler.compile(file.contents.toString(), opts.config);
      if (!data.isValid) {
        return cb();
      }
      file.contents = new Buffer(data.content);
    }

    return cb(null, file);
  });

};

// extend plugin
gulpCompiler.extend = function(obj) {
  compiler.extend(obj);
};

// Exporting the plugin main function
module.exports = gulpCompiler;