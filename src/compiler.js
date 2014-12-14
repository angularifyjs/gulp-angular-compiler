var _ = require('lodash');

module.exports = require('objectjs').extend({

  defConfig: {
    mode: 'auto',
    baseUrls: [],
    dependencies: {},
    priorities: {}
  },

  defOpts: {
    config: null,
    configDir: 'angularify.json'
  },

  buildCss: function(list) {
    var internalLinks = '';
    var externalLinks = '';
    _.each(list, function(href) {
      if (href.indexOf('http://') === 0 || href.indexOf('https://') === 0 || href.indexOf('//') === 0) {
        externalLinks += '<link rel="stylesheet" href="' + href + '">\n  ';
      } else {
        internalLinks += '<link rel="stylesheet" href="' + href + '">\n  ';
      }
    });
    return externalLinks + internalLinks;
  },

  buildJs: function(list) {
  	var internalSrcs = '';
    var externalSrcs = '';
    _.each(list, function(src) {
      if (src.indexOf('http://') === 0 || src.indexOf('https://') === 0 || src.indexOf('//') === 0) {
        externalSrcs += '<script type="text/javascript" src="' + src + '"></script>\n  ';
      } else {
        internalSrcs += '<script type="text/javascript" src="' + src + '"></script>\n  ';
      }
    });
    return externalSrcs + internalSrcs;
  },

  compile: function(content, config) {
    var cssTag = this.getCssTag(content);
    var jsTag = this.getJsTag(content);
    if (!!cssTag) {
      content.replace(cssTag.tag, this.buildCss(this.getAllDirectories('css', cssTag.moduleName, config)));
    }
    if (!!jsTag) {
      content.replace(jsTag.tag, this.buildJs(this.getAllDirectories('js', jsTag.moduleName, config)));
    }
    return content;
  },

  getCssTag: function(content) {
    var tag = content.match(/<!-- angularify:([^:]*):css -->/);
    if (!tag) {
      return null;
    }
    return {
      moduleName: tag[1],
      tag: tag[0]
    };
  },

  getConfigDependencies: function(config) {
    if (config.mode === 'auto') {
      //todo
    }
    return config.dependencies;
  },

  getAllDirectories: function(type, moduleName, config) {

  },

  getModuleDependencies: function(moduleName) {
    return {
      'app': ['app.mod1', 'app.mod2'],
      'app.mod1': ['sample1', 'sampl']
    };
  },

  getJsTag: function(content) {
    var tag = content.match(/<!-- angularify:([^:]*):js -->/);
    if (!tag) {
      return null;
    }
    return {
      moduleName: tag[1],
      tag: tag[0]
    };
  },

  isValid: function(content) {
    return !!this.getCssTag(content) || !!this.getJsTag(content);
  }

});