var path = require('path');
var compiler = require(path.resolve('src', 'compiler.js'));
var MOCK = {
  config: require(path.resolve('test', 'sample', 'angularify.json'))
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
        '<link rel="stylesheet" href="' + '//external/url/css.css' + '">',
        '<link rel="stylesheet" href="' + 'https://sample.com/test/css.css' + '">',
        '<link rel="stylesheet" href="' + '/test/url/css.css' + '">',
        '<link rel="stylesheet" href="' + '/test/url2/css.css' + '">'
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
        '<script type="text/javascript" src="' + '//external/url/js.js' + '"></script>',
        '<script type="text/javascript" src="' + 'https://sample.com/test/js.js' + '"></script>',
        '<script type="text/javascript" src="' + '/test/url/js.js' + '"></script>',
        '<script type="text/javascript" src="' + '/test/url2/js.js' + '"></script>'
      ].join(''));

    });

  });

  describe('buildGroups', function() {

    it('should build groups', function() {
      expect(compiler.buildGroups({
        groups: ['.*min.js$', {
          name: 'sample group name',
          regex: '.*.js$'
        }]
      }, [
        'http://sample.com/lib.min.js',
        'http://sample.com/lib.js',
        'http://sample.com/js.min.js',
        'http://sample.com/js.js'
      ])).toEqual([{
        regex: new RegExp('.*min.js$'),
        dirs: [
          'http://sample.com/lib.min.js',
          'http://sample.com/js.min.js'
        ]
      }, {
        name: 'sample group name',
        regex: new RegExp('.*.js$'),
        dirs: [
          'http://sample.com/lib.js',
          'http://sample.com/js.js'
        ]
      }]);
    });

    it('should build groups with no group input', function() {
      expect(compiler.buildGroups({}, [
        'http://sample.com/lib.min.js',
        'http://sample.com/lib.js',
        'http://sample.com/js.min.js',
        'http://sample.com/js.js'
      ])).toEqual([{
        dirs: [
          'http://sample.com/lib.min.js',
          'http://sample.com/lib.js',
          'http://sample.com/js.min.js',
          'http://sample.com/js.js'
        ]
      }]);
    });

    it('should should return empty list', function() {
      expect(compiler.buildGroups({}, [])).toEqual([]);
    });

  });

  describe('compile', function() {

    it('should compile content', function() {
      expect(compiler.compile('<body> <!-- angularify:app:css --> <!-- angularify:app:js --> </body>', MOCK.config)).toEqual('<body> <link rel="stylesheet" href="/app.css"><link rel="stylesheet" href="/todo/css.css"><link rel="stylesheet" href="/contact/css.css"><link rel="stylesheet" href="/todo/detail/css.css"> <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.0/angular.min.js"></script><script type="text/javascript" src="/app.js"></script><script type="text/javascript" src="/todo/js.js"></script><script type="text/javascript" src="/contact/js.js"></script><script type="text/javascript" src="/todo/detail/js.js"></script> </body>');

      expect(compiler.compile('<body> <!-- angularify:app:css --> </body>', MOCK.config)).toEqual('<body> <link rel="stylesheet" href="/app.css"><link rel="stylesheet" href="/todo/css.css"><link rel="stylesheet" href="/contact/css.css"><link rel="stylesheet" href="/todo/detail/css.css"> </body>');

      expect(compiler.compile('<body> <!-- angularify:app:js --> </body>', MOCK.config)).toEqual('<body> <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.0/angular.min.js"></script><script type="text/javascript" src="/app.js"></script><script type="text/javascript" src="/todo/js.js"></script><script type="text/javascript" src="/contact/js.js"></script><script type="text/javascript" src="/todo/detail/js.js"></script> </body>');

      expect(compiler.compile('<body> <!-- angularify:random:css --> <!-- angularify:random:js --> </body>', MOCK.config)).toEqual('<body>   </body>');
    });

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

  describe('getConfigExtsForCss', function() {

    it('should return config extensions', function() {
      expect(compiler.getConfigExtsForCss(MOCK.config)).toEqual(MOCK.config.exts.css);
    });

  });

  describe('getConfigExtsForJs', function() {

    it('should return config extensions', function() {
      expect(compiler.getConfigExtsForJs(MOCK.config)).toEqual(MOCK.config.exts.js);
    });

  });

  describe('getConfigExtsForInclude', function() {

    it('should return config extensions', function() {
      expect(compiler.getConfigExtsForInclude(MOCK.config)).toEqual(MOCK.config.exts.include);
    });

  });

  describe('getConfigGroups', function() {

    it('should return config groups', function() {
      expect(compiler.getConfigGroups({
        groups: []
      })).toEqual([]);

      expect(compiler.getConfigGroups({
        groups: ['regex1', 'regex2']
      })).toEqual([{
        regex: new RegExp('regex1')
      }, {
        regex: new RegExp('regex2')
      }]);

      expect(compiler.getConfigGroups({
        groups: ['regex1', {
          name: 'group name',
          regex: new RegExp('regex2')
        }]
      })).toEqual([{
        regex: new RegExp('regex1')
      }, {
        name: 'group name',
        regex: new RegExp('regex2')
      }]);

      expect(compiler.getConfigGroups({
        groups: ['regex1', {
          name: 'group name'
        }]
      })).toEqual([{
        regex: new RegExp('regex1')
      }]);
    });

  });

  describe('getConfigPriorities', function() {

    it('should return config priorities', function() {
      expect(compiler.getConfigPriorities(MOCK.config)).toEqual(MOCK.config.priorities);
    });

  });

  describe('getDirectories', function() {

    it('should return list of directories of module x', function() {
      expect(compiler.getDirectories(['js', 'min.js'], 'app', MOCK.config)).toEqual([
        'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.0/angular.min.js',
        '/app.js',
        '/todo/js.js',
        '/contact/js.js',
        '/todo/detail/js.js'
      ]);

      expect(compiler.getDirectories(['css', 'min.css'], 'app', MOCK.config)).toEqual([
        '/app.css',
        '/todo/css.css',
        '/contact/css.css',
        '/todo/detail/css.css'
      ]);

      expect(compiler.getDirectories(['css', 'min.css'], 'todo', MOCK.config)).toEqual([
        '/todo/css.css',
        '/todo/detail/css.css'
      ]);

      expect(compiler.getDirectories(['css', 'min.css'], 'random', MOCK.config)).toEqual([]);
    });

  });

  describe('getInjectors', function() {

    it('should return valid injectors with default value', function() {
      var injectors = compiler.getInjectors();
      expect(injectors.onBuildCss('hello moto')).toEqual('hello moto');
      expect(injectors.onBuildJs('hello moto')).toEqual('hello moto');
    });

    it('should return valid injectors', function() {
      var injectors = compiler.getInjectors({
        onBuildCss: function(data, info) {
          return data + ' moto';
        }
      });
      expect(injectors.onBuildCss('hello')).toEqual('hello moto');
      expect(injectors.onBuildJs('hello moto')).toEqual('hello moto');
    });

  });

  describe('getModuleDependencies', function() {

    it('should return dependencies tree', function() {
      expect(compiler.getModuleDependencies('app', MOCK.config)).toEqual({
        app: ['todo', 'contact'],
        todo: ['todo.detail'],
        contact: [],
        'todo.detail': []
      });

      expect(compiler.getModuleDependencies('todo', MOCK.config)).toEqual({
        todo: ['todo.detail'],
        'todo.detail': []
      });

      expect(compiler.getModuleDependencies('contact', MOCK.config)).toEqual({
        contact: []
      });

      expect(compiler.getModuleDependencies('random', MOCK.config)).toEqual({});
    });

  });

  describe('getModuleInfo', function() {

    it('should return null', function() {
      expect(compiler.getModuleInfo('sample abc xyz')).toEqual(null);
    });

    it('should return module name only', function() {
      expect(compiler.getModuleInfo('abc angular.module(  "sample"  ).run(function(){})')).toEqual(jasmine.objectContaining({
        'sample': []
      }));
      expect(compiler.getModuleInfo('abc angular.module("sample").run(function(){}; angular.module("hello").run(function(){}))')).toEqual({
        'sample': [],
        'hello': []
      });
    });

    it('should return module name with dependencies', function() {
      expect(compiler.getModuleInfo('abc angular.module("sample", [   "abc",    "xyz"  ]).run(); angular.module("hello", ["moto"]).run(); angular.module("sample").run();')).toEqual({
        'sample': ['abc', 'xyz'],
        'hello': ['moto']
      });
    });

  });

  describe('getModuleInfoFromDir', function() {

    it('should return module info', function() {
      expect(compiler.getModuleInfoFromDir('/app.js', MOCK.config)).toEqual({
        app: ['todo', 'contact']
      });
    });

    it('should return module info', function() {
      expect(compiler.getModuleInfoFromDir('/todo/detail/js.js', MOCK.config)).toEqual({
        'todo.detail': []
      });
    });

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

  describe('isValidImportScript', function() {

    it('should false', function() {
      expect(compiler.isValidImportScript('http://sample/library/url.com', {
        exts: {
          include: ['js', 'min.js']
        }
      })).toEqual(false);
    });

    it('should false', function() {
      expect(compiler.isValidImportScript('https://sample/library/url.com', {
        exts: {
          include: ['js', 'min.js']
        }
      })).toEqual(false);
    });

    it('should false', function() {
      expect(compiler.isValidImportScript('//sample/library/url.com', {
        exts: {
          include: ['js', 'min.js']
        }
      })).toEqual(false);
    });

    it('should false', function() {
      expect(compiler.isValidImportScript('/sample/library/url.com', {
        exts: {
          include: ['js', 'min.js']
        }
      })).toEqual(false);
    });

    it('should false', function() {
      expect(compiler.isValidImportScript('/sample/library/url.js.js', {
        exts: {
          include: ['js', 'min.js']
        }
      })).toEqual(false);
    });

    it('should true', function() {
      expect(compiler.isValidImportScript('/sample/library/url.js', {
        exts: {
          include: ['js', 'min.js']
        }
      })).toEqual(true);
    });

    it('should true', function() {
      expect(compiler.isValidImportScript('/sample/library/url.min.js', {
        exts: {
          include: ['js', 'min.js']
        }
      })).toEqual(true);
    });

  });

});