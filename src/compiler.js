var _ = require('lodash');
var path = require('path');
var fs = require('fs');

module.exports = require('objectjs').extend({

  defConfig: {
    mode: 'auto',
    baseDirs: [],
    exts: ["js", "min.js"],
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

  getConfigBaseDirs: function(config) {
    return config.baseDirs;
  },

  getConfigDependencies: function(config) {
    if (config.mode === 'auto') {
      //todo
    }
    return config.dependencies;
  },

  getConfigPriorities: function(config) {
    return config.priorities;
  },

  getAllDirectories: function(type, moduleName, config) {
    var configDependencies = this.getConfigDependencies(config);
    var moduleDependencies = this.getModuleDependencies(moduleName, config);

  },

  getModuleDependencies: function(moduleName, config) {
    var configDependencies = this.getConfigDependencies(config);
    var modules = {};
    var queue = [];
    queue.push(moduleName);
    while (true) {
      if (queue.length === 0) {
        break;
      }
      moduleName = queue.shift();
      if (!configDependencies[moduleName]) {
        continue;
      }
      if (!modules[moduleName]) {
        modules[moduleName] = [];
      }
      // _.each(configDependencies[moduleName], function(src) {
      //   if () {

      //   }
      //   _.each(this.getConfigBaseDirs(), function(dirName) {
      //     if () {

      //     }
      //   });
      // }.bind(this));
    }
  },

  getModuleInfo: function(content) {
  	var res = null;
  	var regex = /angular.module\(\s*['"]([^'"]*)['"]\s*\)/;
  	var regexG = /angular.module\(\s*['"]([^'"]*)['"]\s*\)/g;
  	_.each(content.match(regexG), function(match) {
  		var tmp = match.match(regex);
  		if (tmp) {
  			if (!res) {
  				res = {};
  			}
  			res[tmp[1]] = [];
  		}
  	});

  	regex = /angular.module\(\s*['"]([^'"]*)['"]\s*,\s*\[([^\[\]]*)\]\)/;
  	regexG = /angular.module\(\s*['"]([^'"]*)['"]\s*,\s*\[([^\[\]]*)\]\)/g;
  	_.each(content.match(regexG), function(match) {
  		var tmp = match.match(regex);
  		if (tmp) {
  			if (!res) {
  				res = {};
  			}
  			res[tmp[1]] = _.union(res[tmp[1]] || [], tmp[2].replace(/[ '"]/g, '').split(','));
  		}
  	});
  	return res;
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