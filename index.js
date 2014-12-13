// through2 is a thin wrapper around node transform streams
var path = require('path');
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var compiler = require(path.resolve(__dirname, 'src', 'compiler.js'));

// Consts
const PLUGIN_NAME = 'gulp-angular-compiler';

function prefixStream(prefixText) {
  var stream = through();
  stream.write(prefixText);
  return stream;
}

// Plugin level function(dealing with files)
function gulpCompiler(prefixText) {

  prefixText = compiler.hello();

  if (!prefixText) {
    throw new PluginError(PLUGIN_NAME, 'Missing prefix text!');
  }

  prefixText = new Buffer(prefixText); // allocate ahead of time

  // Creating a stream through which each file will pass
  return through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      // return empty file
      cb(null, file);
    }

    if (file.isBuffer()) {
      file.contents = Buffer.concat([prefixText, file.contents]);
    }

    if (file.isStream()) {
      // define the streamer that will transform the content
      var streamer = prefixStream(prefixText);
      // catch errors from the streamer and emit a gulp plugin error
      streamer.on('error', this.emit.bind(this, 'error'));
      // start the transformation
      file.contents = file.contents.pipe(streamer);
    }

    cb(null, file);
  });

};

// extend plugin
gulpCompiler.extend = function(obj) {
  compiler.extend(obj);
};

// Exporting the plugin main function
module.exports = gulpCompiler;