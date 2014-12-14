var path = require('path');
var compiler = require(path.resolve('src', 'compiler.js'));
var MOCK = {
  config: {
    'mode': 'auto',
    'baseUrls': [
      'root/dir/1',
      'root/dir/2'
    ],
    'dependencies': {
      'angularModuleName': [
        'http://sample.com/js.js',
        '/javascript/web/url/1.css',
        '/javascript/web/url/1.js',
        '/javascript/web/url/2.js'
      ]
    },
    'priorities': {
      '/javascript/web/url/1.js': 10,
      '/this/should/have/higher/prioriy.js': 1
    }
  }
};

describe('compiler', function() {

  describe('buildCss', function() {

    it('should return empty string when input list is null', function() {
      expect(compiler.buildCss()).toEqual('');
    });

    it('should return empty string when input list is empty', function() {
      expect(compiler.buildCss([])).toEqual('');
    });

    it('should return link tags in string', function() {
      expect(compiler.buildCss([
        '/test/url/css.css',
        '//external/url/css.css',
        'https://sample.com/test/css.css',
        '/test/url2/css.css'
      ])).toEqual([
        '<link rel="stylesheet" href="' + '//external/url/css.css' + '">\n  ',
        '<link rel="stylesheet" href="' + 'https://sample.com/test/css.css' + '">\n  ',
        '<link rel="stylesheet" href="' + '/test/url/css.css' + '">\n  ',
        '<link rel="stylesheet" href="' + '/test/url2/css.css' + '">\n  '
      ].join(''));

    });

  });

  describe('buildJs', function() {

    it('should return empty string when input list is null', function() {
      expect(compiler.buildJs()).toEqual('');
    });

    it('should return empty string when input list is empty', function() {
      expect(compiler.buildJs([])).toEqual('');
    });

    it('should return link tags in string', function() {
      expect(compiler.buildJs([
        '/test/url/js.js',
        '//external/url/js.js',
        'https://sample.com/test/js.js',
        '/test/url2/js.js'
      ])).toEqual([
        '<script type="text/javascript" src="' + '//external/url/js.js' + '"></script>\n  ',
        '<script type="text/javascript" src="' + 'https://sample.com/test/js.js' + '"></script>\n  ',
        '<script type="text/javascript" src="' + '/test/url/js.js' + '"></script>\n  ',
        '<script type="text/javascript" src="' + '/test/url2/js.js' + '"></script>\n  '
      ].join(''));

    });

  });

  describe('compile', function() {
  	// todo
  });

  describe('getCssTag', function() {

    it('should return null', function() {
      var tag = compiler.getCssTag('hello moto');
      expect(tag).toEqual(null);
    });

    it('should return null', function() {
      var tag = compiler.getCssTag('hello <!-- angularify:sample_app:css --> <!-- angularify:sample_app:js --> moto');
      expect(tag).toEqual(jasmine.objectContaining({
        moduleName: 'sample_app',
        tag: '<!-- angularify:sample_app:css -->'
      }));
    });

  });

  describe('getConfigDependencies', function() {

    it('should return dependencies', function() {
      expect(compiler.getConfigDependencies(MOCK.config)).toEqual(MOCK.config.dependencies);
    });

  });

  describe('getAllDirectories', function() {
  	// todo
  });

  describe('getModuleDependencies', function() {
  	// todo
  });

  describe('getJsTag', function() {

    it('should return null', function() {
      var tag = compiler.getJsTag('hello moto');
      expect(tag).toEqual(null);
    });

    it('should return null', function() {
      var tag = compiler.getJsTag('hello <!-- angularify:sample_app:css --> <!-- angularify:sample_app:js --> moto');
      expect(tag).toEqual(jasmine.objectContaining({
        moduleName: 'sample_app',
        tag: '<!-- angularify:sample_app:js -->'
      }));
    });

  });

  describe('isValid', function() {

  	it('should false', function() {
  		expect(compiler.isValid('hello moto')).toEqual(false);
  	});

  	it('should true', function() {
  		expect(compiler.isValid('hello <!-- angularify:sample_app:css --> moto')).toEqual(true);
  		expect(compiler.isValid('hello <!-- angularify:sample_app:js --> moto')).toEqual(true);
  		expect(compiler.isValid('hello <!-- angularify:sample_app:css --> <!-- angularify:sample_app:js --> moto')).toEqual(true);
  	});

  });



});