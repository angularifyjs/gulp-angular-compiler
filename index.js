// through2 is a thin wrapper around node transform streams
var _ = require('lodash');
var path = require('path');
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var compiler = require(path.resolve(__dirname, 'src', 'compiler.js'));
var fs = require('fs');

// Consts
const PLUGIN_NAME = 'gulp-angular-compiler';

// Plugin level function(dealing with files)
function gulpCompiler(opts) {
  opts = _.extend({}, compiler.defOpts, opts);

  if (!opts.config && !!opts.configDir) {
    try {
      opts.config = JSON.parse(fs.readFileSync(path.resolve(opts.configDir), {
        encoding: 'utf8'
      }));
    } catch (ex) {}
  }

  if (!opts || !opts.config) {
    throw new PluginError(PLUGIN_NAME, 'Missing opts.config!');
  }

  opts.config = _.extend({}, compiler.defConfig, opts.config);

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
      var content = file.contents.toString();
      if (!compiler.isValid(content)) {
        return cb();
      }
      file.contents = new Buffer(compiler.compile(content, opts.config, opts.injectors));
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
