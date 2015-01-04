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
        externalLinks += '<link rel="stylesheet" href="' + href + '">';
      } else {
        internalLinks += '<link rel="stylesheet" href="' + href + '">';
      }
    });
    return externalLinks + internalLinks;
  },

  buildJs: function(list) {
    var internalSrcs = '';
    var externalSrcs = '';
    _.each(list, function(src) {
      if (src.indexOf('http://') === 0 || src.indexOf('https://') === 0 || src.indexOf('//') === 0) {
        externalSrcs += '<script type="text/javascript" src="' + src + '"></script>';
      } else {
        internalSrcs += '<script type="text/javascript" src="' + src + '"></script>';
      }
    });
    return externalSrcs + internalSrcs;
  },

  compile: function(content, config) {
    var cssTag = this.getCssTag(content);
    var jsTag = this.getJsTag(content);
    if (!!cssTag) {
      content = content.replace(cssTag.tag, this.buildCss(this.getDirectories(['css', 'min.css'], cssTag.moduleName, config)));
    }
    if (!!jsTag) {
      content = content.replace(jsTag.tag, this.buildJs(this.getDirectories(['js', 'min.js'], jsTag.moduleName, config)));
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
      // todo
    }
    return config.dependencies;
  },

  getConfigExts: function(config) {
    return config.exts;
  },

  getConfigMode: function(config) {
    return config.mode;
  },

  getConfigPriorities: function(config) {
    return config.priorities;
  },

  getDirectories: function(types, moduleName, config) {
    var dirs = {};
    var regexTypes = [];
    _.each(!_.isArray(types) ? [types] : types, function(type) {
      regexTypes.push(new RegExp('\/[^.\/]*.' + type + '$'));
    });
    var configDependencies = this.getConfigDependencies(config);
    var configPriorities = this.getConfigPriorities(config);
    _.each(this.getModuleDependencies(moduleName, config), function(dependencies, name) {
      _.each(_.union([name], dependencies), function(moduleName) {
        _.each(configDependencies[moduleName], function(dir) {
          _.each(regexTypes, function(regexType) {
            if (regexType.test(dir)) {
              dirs[dir] = {
                name: dir,
                priority: configPriorities[dir] || 0
              };
            }
          });
        });
      });
    });
    dirs = _.sortBy(_.values(dirs), function(obj) {
      return -obj.priority;
    });
    var res = [];
    _.each(dirs, function(obj) {
      res.push(obj.name);
    });
    return res;
  },

  getModuleDependencies: function(moduleName, config) {
    var modules = {};
    var queue = [];
    var configDependencies = this.getConfigDependencies(config);
    var importedDirs = [];
    queue.push(moduleName);
    while (true) {
      if (queue.length === 0) {
        break;
      }
      moduleName = queue.shift();
      _.each(configDependencies[moduleName], function(dir) {
        if (_.indexOf(importedDirs, dir) >= 0) {
          return;
        }
        importedDirs.push(dir);
        _.each(this.getModuleInfoFromDir(dir, config), function(dependencies, name) {
          _.each(_.union([name], dependencies), function(value) {
            queue.push(value);
          });
          modules[name] = !!modules[name] ? _.union([modules[name]], dependencies) : dependencies;
        });
      }.bind(this));
    }
    return modules;
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
        var dStr = tmp[2].replace(/[\s\'\"\n\t]/g, '');
        res[tmp[1]] = _.union(res[tmp[1]] || [], dStr === '' ? [] : dStr.split(','));
      }
    });
    return res;
  },

  getModuleInfoFromDir: function(dir, config) {
    if (!this.isValidImportScript(dir, config)) {
      return null;
    }
    var res = null;
    _.each(this.getConfigBaseDirs(config), function(baseDir) {
      try {
        if (!!res) {
          return;
        }
        res = this.getModuleInfo(fs.readFileSync(path.join(baseDir, dir), {
          encoding: 'utf8'
        }));
      } catch (ex) {}
    }.bind(this));
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
  },

  isValidImportScript: function(dir, config) {
    var res = false;
    _.each(this.getConfigExts(config), function(ext) {
      ext = new RegExp('\/[^.\/]*.' + ext + '$');
      if (ext.test(dir) && dir.indexOf('http://') !== 0 &&
        dir.indexOf('https://') !== 0 && dir.indexOf('//') !== 0) {
        res = true;
      }
    });
    return res;
  }

});